from pathlib import Path

from fastapi.testclient import TestClient

from server.app import Monitor, SensorSample, create_app

ROOT = Path(__file__).resolve().parents[2]
HEADERS = {"X-Seismo-Key": "test-secret"}


def make_client():
    return TestClient(create_app(ingest_key="test-secret", root=ROOT))


def post_samples(client, acceleration, n=3, source="demo"):
    data = None
    for _ in range(n):
        response = client.post(
            "/api/sample",
            json={"acceleration_g": acceleration, "source": source, "device_id": "test"},
            headers=HEADERS,
        )
        assert response.status_code == 200
        data = response.json()
    return data


def test_authenticated_demo_status_transitions_and_latch():
    with make_client() as client:
        assert client.get("/api/state").json()["level"] == "OFFLINE"
        assert post_samples(client, .03)["level"] == "NORMAL"
        assert post_samples(client, .23)["level"] == "WARNING"
        alarm = post_samples(client, .52)
        assert alarm["level"] == "EMERGENCY"
        assert alarm["latched"] is True
        assert alarm["source"] == "demo"
        assert post_samples(client, .01)["level"] == "EMERGENCY"
        reset = client.post("/api/reset", headers=HEADERS)
        assert reset.status_code == 200
        assert reset.json()["level"] == "NORMAL"


def test_missing_key_rejected_and_bad_input_rejected():
    with make_client() as client:
        r = client.post("/api/sample", json={"acceleration_g": .5})
        assert r.status_code == 401
        r = client.post("/api/sample", json={"acceleration_g": 10}, headers=HEADERS)
        assert r.status_code == 422
        assert client.post("/api/reset").status_code == 401


def test_offline_is_not_normal_and_emergency_stays_latched():
    m = Monitor(timeout_s=-1)
    assert m.snapshot()["level"] == "OFFLINE"
    for _ in range(3):
        m.ingest(SensorSample(acceleration_g=.1))
    assert m.snapshot()["level"] == "OFFLINE"
    for _ in range(3):
        m.ingest(SensorSample(acceleration_g=.5))
    assert m.snapshot()["level"] == "EMERGENCY"
    assert m.snapshot()["sensor_online"] is False


def test_original_site_is_served_with_local_bridge_only_in_vm():
    with make_client() as client:
        home = client.get("/")
        assert home.status_code == 200
        assert 'Seismo Almaty' in home.text
        assert '/server/live-bridge.js' in home.text
        three = client.get("/simulation-3d/")
        assert three.status_code == 200
        assert '/server/live-bridge.js' in three.text
        assert client.get("/simulation-state.js").status_code == 200
        assert client.get("/server/live-bridge.js").status_code == 200
        assert client.get("/server/app.py").status_code == 404
        assert client.get("/.env").status_code == 404
        assert client.get("/.git/config").status_code == 404


def test_websocket_state_snapshot():
    with make_client() as client:
        with client.websocket_connect("/ws") as ws:
            packet = ws.receive_json()
            assert packet["level"] == "OFFLINE"
            assert packet["simulation_only"] is True


def test_no_key_configured_also_rejects_write():
    with TestClient(create_app(ingest_key="", root=ROOT)) as client:
        resp = client.post("/api/sample", json={"acceleration_g": 0.5}, headers=HEADERS)
        assert resp.status_code == 401
