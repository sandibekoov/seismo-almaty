# SEISMO ALMATY — KBTU Campus Lab

The team's Three.js model is an educational visualisation of an ESP32 + MPU6050
building prototype. Simulation is independent of real earthquake feeds. No
commands are issued to the device, no real alarm is sent.
The campus is a schematic educational model with five virtual floors. The
embedded and full-screen model, resident page, map and events share one scenario
through simulation-state.js and same-origin localStorage. Select M 0–8 or one
of the M 3.0/4.5/6.0 presets. These are training labels; the synthetic signal
0–100 is not calculated physical acceleration or a measured magnitude.
M 6 and above first produce WARNING for two seconds, then EMERGENCY; the
protection latch remains until Reset. Stop shaking preserves the latch.
Auto Demo progresses through three levels and ends shaking after 18 seconds.
The demo does not configure the actual ESP32. Live telemetry is separate.
Kazakh, Russian and English use the main site's stored language preference.
On devices without WebGL, the same scene and camera are projected onto a
Canvas 2D surface with simplified lighting.

## ESP32 telemetry

In **ESP32 Live**, connect over USB from a browser that supports Web Serial.
Choose the baud rate matching the firmware (115200 by default). The firmware
must send UTF-8 JSON, one object per newline, e.g.:

```json
{"source":"esp32","accelerationG":0.08,"state":"NORMAL","powerOn":true,"gasOpen":true,"liftMoving":false,"alarmOn":false,"floor":2}
```

- `accelerationG`: measured acceleration/vibration metric in g, non-negative;
  firmware must document its method of gravity removal, filtering and calibration.
- `state`: NORMAL, WARNING, EMERGENCY or FAULT, computed by the device.
- actuator booleans and floor (1–5, with 1–3 supported as before): commanded/model state, not physical
  position confirmation unless separate feedback is implemented.
- Missing or invalid frames are ignored; after two seconds without valid data
  the UI reports stale telemetry. Disconnected devices are not simulated.
- 3D magnitudes and thresholds are illustrative, not measurements, and never
  used to infer the ESP32 state.

USB hardware and firmware integration must be tested with the team's actual
device. Internet/Wi-Fi monitoring requires a separate authenticated telemetry
backend; the static site does not expose a device control endpoint.
