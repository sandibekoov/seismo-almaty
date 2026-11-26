"""Local educational IoT gateway for Seismo Almaty.

This is not an earthquake early-warning or safety control system.
Use one Uvicorn worker: state is intentionally in memory.
"""
from __future__ import annotations

import asyncio
import hmac
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal, Optional, Union

from fastapi import FastAPI, Header, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
WARNING_G = 0.15  # Illustrative thresholds, NOT certified seismic limits.
EMERGENCY_G = 0.35
CONFIRM_SAMPLES = 3
SENSOR_TIMEOUT_S = 5.0


class SensorSample(BaseModel):
    acceleration_g: float = Field(ge=0.0, le=4.0)
    source: Literal["demo", "esp32"] = "esp32"
    device_id: str = Field(default="esp32", min_length=1, max_length=32)


class Monitor:
    def __init__(self, timeout_s: float = SENSOR_TIMEOUT_S) -> None:
        self.timeout_s = timeout_s
        self.level = "NORMAL"
        self.latched = False
        self.warning_hits = 0
        self.emergency_hits = 0
        self.normal_hits = 0
        self.last_monotonic: Optional[float] = None
        self.last_utc: Optional[str] = None
        self.last_g: Optional[float] = None
        self.source: Optional[str] = None
        self.device_id: Optional[str] = None
        self.samples = 0

    def ingest(self, sample: SensorSample) -> dict:
        self.last_monotonic = time.monotonic()
        self.last_utc = datetime.now(timezone.utc).isoformat()
        self.last_g = sample.acceleration_g
        self.source = sample.source
        self.device_id = sample.device_id
        self.samples += 1

        value = sample.acceleration_g
        self.warning_hits = self.warning_hits + 1 if value >= WARNING_G else 0
        self.emergency_hits = self.emergency_hits + 1 if value >= EMERGENCY_G else 0
        self.normal_hits = self.normal_hits + 1 if value < WARNING_G else 0

        if not self.latched:
            if self.emergency_hits >= CONFIRM_SAMPLES:
                self.level = "EMERGENCY"
                self.latched = True
            elif self.warning_hits >= CONFIRM_SAMPLES:
                self.level = "WARNING"
            elif self.normal_hits >= CONFIRM_SAMPLES:
                self.level = "NORMAL"
        return self.snapshot()

    def reset(self) -> dict:
        self.level = "NORMAL"
        self.latched = False
        self.warning_hits = self.emergency_hits = self.normal_hits = 0
        return self.snapshot()

    def snapshot(self) -> dict:
        online = (
            self.last_monotonic is not None
            and time.monotonic() - self.last_monotonic <= self.timeout_s
        )
        # No fresh data is UNKNOWN, never a claim of physical safety.
        shown = self.level if online or self.latched else "OFFLINE"
        return {
            "level": shown,
            "sensor_online": online,
            "latched": self.latched,
            "acceleration_g": self.last_g if online else None,
            "source": self.source,
            "device_id": self.device_id,
            "last_seen_utc": self.last_utc,
            "samples_received": self.samples,
            "simulation_only": True,
            "thresholds_g": {
                "warning": WARNING_G,
                "emergency": EMERGENCY_G,
                "confirm_samples": CONFIRM_SAMPLES,
            },
        }


class PublicSiteFiles(StaticFiles):
    """Do not publish local secrets, Git metadata or Python server source."""

    async def get_response(self, path: str, scope: dict):
        parts = path.replace("\\", "/").split("/")
        if "server" in parts or any(part.startswith(".") for part in parts if part):
            raise HTTPException(status_code=404)
        return await super().get_response(path, scope)


def create_app(
    ingest_key: Optional[str] = None,
    root: Path = ROOT,
    timeout_s: float = SENSOR_TIMEOUT_S,
) -> FastAPI:
    key = ingest_key if ingest_key is not None else os.getenv("SEISMO_INGEST_KEY", "")
    monitor = Monitor(timeout_s=timeout_s)
    app = FastAPI(
        title="Seismo Almaty Local Gateway",
        description="LAN-only educational sensor transport; not life-safety equipment.",
        version="1.0.0",
    )
    app.state.monitor = monitor

    def require_key(value: Optional[str]) -> None:
        if not key or not value or not hmac.compare_digest(value, key):
            raise HTTPException(status_code=401, detail="Valid X-Seismo-Key required")

    @app.get("/api/health")
    async def health():
        return {"ok": True, "service": "seismo-local", "key_configured": bool(key)}

    @app.get("/api/state")
    async def state():
        return monitor.snapshot()

    @app.post("/api/sample")
    async def sample(reading: SensorSample, x_seismo_key: Optional[str] = Header(default=None)):
        require_key(x_seismo_key)
        return monitor.ingest(reading)

    @app.post("/api/reset")
    async def reset(x_seismo_key: Optional[str] = Header(default=None)):
        require_key(x_seismo_key)
        return monitor.reset()

    @app.websocket("/ws")
    async def ws_status(websocket: WebSocket):
        # Read-only WebSocket. We deliberately do not accept remote control commands.
        await websocket.accept()
        try:
            while True:
                await websocket.send_json(monitor.snapshot())
                await asyncio.sleep(0.5)
        except (WebSocketDisconnect, RuntimeError, OSError):
            pass

    @app.get("/server/live-bridge.js", include_in_schema=False)
    async def live_bridge():
        return FileResponse(root / "server" / "live-bridge.js", media_type="text/javascript")

    def site_page(path: str) -> HTMLResponse:
        html = (root / path).read_text(encoding="utf-8")
        script = '<script defer src="/server/live-bridge.js"></script>'
        return HTMLResponse(
            html.replace("</body>", script + "\n</body>"),
            headers={"Cache-Control": "no-store"},
        )

    @app.get("/", include_in_schema=False)
    @app.get("/index.html", include_in_schema=False)
    async def home():
        return site_page("index.html")

    @app.get("/simulation-3d", include_in_schema=False)
    @app.get("/simulation-3d/", include_in_schema=False)
    @app.get("/simulation-3d/index.html", include_in_schema=False)
    async def three_d():
        return site_page("simulation-3d/index.html")

    # LAST: keep existing CSS, JS, photos, engineering UI and 3D assets unchanged.
    app.mount("/", PublicSiteFiles(directory=str(root), html=True), name="site")
    return app


app = create_app()
