"""Send synthetic readings to the LAN gateway; no ESP32 hardware needed.

Example: python3 server/demo_sender.py --url http://127.0.0.1:8000
The SEISMO_INGEST_KEY environment variable must be set.
"""
import argparse
import json
import os
import time
from urllib.request import Request, urlopen


def send(base_url: str, key: str, g: float) -> dict:
    body = json.dumps({
        "acceleration_g": g,
        "source": "demo",
        "device_id": "synthetic-cli",
    }).encode("utf-8")
    req = Request(
        base_url.rstrip("/") + "/api/sample",
        data=body,
        headers={"Content-Type": "application/json", "X-Seismo-Key": key},
        method="POST",
    )
    with urlopen(req, timeout=8) as response:
        return json.load(response)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://127.0.0.1:8000")
    args = parser.parse_args()
    key = os.environ.get("SEISMO_INGEST_KEY", "")
    if not key:
        parser.error("Set SEISMO_INGEST_KEY in this shell first")
    for name, value in [
        ("NORMAL", 0.03), ("WARNING", 0.21), ("EMERGENCY", 0.51)
    ]:
        for _ in range(4):
            data = send(args.url, key, value)
            print(f"{name}: {value:.2f} g -> {data['level']}")
            time.sleep(0.35)
        time.sleep(1.2)
    print("EMERGENCY is latched; POST /api/reset with the key to clear.")
