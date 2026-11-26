# Seismo Almaty — local VMware server

Educational LAN gateway for the existing Seismo Almaty frontend. A single Ubuntu VM
serves the **unchanged website**, `/simulation-3d/`, and a separate read-only live
sensor status panel. Incoming ESP32/demo data is broadcast to clients using WebSocket.

**Not a public earthquake early warning service. No PLC, gas valve, elevator or
alarm is controlled.** This version does not automatically run the 3D evacuation
from physical measurements; 3D has its original independent training controls.

## 1. VMware + Ubuntu

Install Ubuntu Server 24.04 LTS (or a supported current Ubuntu Server) in VMware.
Prefer a **Bridged** network adapter to put the VM, laptop, phone and ESP32 on the
same trusted Wi-Fi/hotspot. This works only when that network allows client-to-client
connections. Some hotspots and Wi-Fi adapters block bridging; in that case use
**NAT with a forwarded host TCP port 8000**, and connect devices to the host IP.

In Ubuntu, run:

```bash
sudo apt update
sudo apt install -y git python3-venv python3-pip
git clone https://github.com/sandibekoov/seismo-almaty.git
cd seismo-almaty
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r server/requirements.txt
# Create a private key; never put it in Git or JavaScript.
export SEISMO_INGEST_KEY="$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')"
printf 'SEISMO_INGEST_KEY=%s\n' "$SEISMO_INGEST_KEY" > server/.env
chmod 600 server/.env
python -m uvicorn server.app:app --host 0.0.0.0 --port 8000
```

In **another** Ubuntu terminal, load the key and identify the VM address:

```bash
cd seismo-almaty
set -a; source server/.env; set +a
hostname -I
python3 server/demo_sender.py
```

Open `http://VM_IP:8000/` on a computer/phone on the same LAN. Use
`http://VM_IP:8000/simulation-3d/` for the standalone 3D view.
`http://VM_IP:8000/api/health` returns a simple health check.
The live sensor panel initially shows **OFFLINE**. This means there is no
fresh sensor sample, **not** that the building is safe.

If Ubuntu's UFW is active, allow TCP 8000 on the **trusted local subnet only**.
Do not expose port 8000 or the token to the public internet. Keep one worker:
the demo monitor state is deliberately stored in the server process.

## 2. Verify NORMAL → WARNING → EMERGENCY

```bash
# Second terminal with SEISMO_INGEST_KEY exported:
python3 server/demo_sender.py --url http://127.0.0.1:8000
curl -X POST http://127.0.0.1:8000/api/reset \
  -H "X-Seismo-Key: $SEISMO_INGEST_KEY"
```

The generator sends synthetic values, labelled **TEST DATA** in the UI.
Educational thresholds are 0.15 g WARNING and 0.35 g EMERGENCY, confirmed after
three consecutive samples. The EMERGENCY flag latches until an authenticated
reset, even if samples cease. Other disconnected states show OFFLINE after 5 s.
These thresholds **are not verified seismic/structural safety criteria**.

`POST /api/sample` JSON format:

```json
{
  "acceleration_g": 0.22,
  "source": "demo",
  "device_id": "synthetic-cli"
}
```

Add the header `X-Seismo-Key: <your-secret>`. To connect an actual ESP32,
send measured acceleration values with `source: "esp32"` (only if the sensor is
actually connected and the unit conversion to `g` is validated). Do not
interpret `acceleration_g` as earthquake magnitude M. Use an approved sensor
driver appropriate to the **actual hardware**; no MPU6050 is assumed.

Read-only interfaces:

- `GET /api/health` — server online / key configured
- `GET /api/state` — last sample, source, signal freshness, status
- `WS /ws` — status JSON twice per second
- `POST /api/reset` — clear demo alarm latch, requires key

## 3. Site behavior and limitations

The existing GitHub Pages address remains a **public static demo**. Its
browser-local NORMAL/WARNING/EMERGENCY simulation remains untouched.

The **VM-hosted** address serves that same site but injects
`/server/live-bridge.js`, which adds a separate LOCAL status card. This avoids
confusing measured/synthetic sensor values with simulated magnitude and
avoids corrupting the existing 3D safety sequence.

To demonstrate without an internet connection, third-party images, maps,
Google fonts and the Three.js/Leaflet CDN dependencies must first be served
locally; this initial gateway does **not** bundle them. Also note that
geolocation and browser USB/Web Serial on a phone may require HTTPS/secure
contexts: `http://VM_IP:8000` is for the local demo only.

Avoid placing private data or tokens in the web root. `server/.env`,
`server/*.py`, hidden files and `.git/` are blocked from static delivery.

## 4. Tests

```bash
python -m pip install -r server/requirements.txt
python -m pytest -q server/tests
```

Tested features cover API token handling, state transitions, offline behavior,
server-side injection, static-file access restrictions, and WebSocket.
Tests do **not** verify real ESP32 hardware, a physical VM network, real
building devices, or functional safety.

## Sources

- FastAPI: https://fastapi.tiangolo.com/advanced/websockets/
- FastAPI StaticFiles: https://fastapi.tiangolo.com/tutorial/static-files/
- Uvicorn: https://uvicorn.dev/settings/
- Browser secure contexts: https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts
