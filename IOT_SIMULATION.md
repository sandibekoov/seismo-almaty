# IoT Simulation Mode — educational behavior contract

## Context

Seismo Almaty is a **student project for the Internet of Things (IoT) course**. This web mode is an interactive educational prototype demonstrating the flow from a synthetic vibration signal to controller-like decision logic and a resident UI.

The software **does not predict earthquakes**, detect building safety, or issue actual warnings. The real USGS catalogue remains entirely separate.

## Enter and operate

1. Open **Profile → Simulation Mode** (also accessible from **Instructions → Simulation Mode · IoT**).
2. Choose one of three presets:
   - **M 3.0** → synthetic signal intensity 16/100, demo **NORMAL**.
   - **M 4.5** → synthetic signal intensity 49/100, demo **WARNING**.
   - **M 6.0** → synthetic signal intensity 83/100, demo **EMERGENCY**; opens the explicitly labelled training warning screen.
3. Inspect the **synthetic waveform** and the **simulated building output commands**.
4. Tap **На карте** to inspect the purple **ТЕСТ** earthquake marker on a *fictional* epicentre near the center of Almaty. It does not represent a registered event.
5. Tap **В событиях** to see a separate purple **СИМУЛЯЦИЯ** card, visibly distinct from the list of historical real USGS records.
6. Tap **Сбросить** to remove the demo marker and entry and restore the OFF state.

No simulated earthquake is written into the USGS data list. Reloading the site starts with the simulation OFF. No simulated event is saved to localStorage.

## Logic and technical honesty

```
Synthetic signal preset
     ↓
Demo controller state (NORMAL / WARNING / EMERGENCY)
     ↓
Training-only building command labels
     ↓
Resident UI: Simulation Mode + map test marker + events test card
```

These are **scenario presets**. A numerical earthquake magnitude and a vibration sensor's amplitude are **not equivalent physical quantities** and there is no physically derived relationship between them in this mode. The waveform is a deterministic visual simulation, not measured Arduino output.

The 4 building states (gas, power, lift, emergency doors) are *UI labels only*. No actual actuator, PLC, cloud platform, SMS, ambulance, SOS dispatch or emergency notification is controlled here.

The pre-existing **Engineering Demo** at `/engineering/` still contains a separate simulated Flex Sensor / oscilloscope, optional smartphone accelerometer and Web Serial functionality. The IoT Simulation Mode **is not connected to that simulator or to a physical Arduino**; end-to-end physical hardware integration would need its own validated protocol and test evidence.

## QA

### Performed in code environment

- JavaScript parses with V8.
- Online-mode mock: USGS record count = 1, unchanged across all simulation presets and after reset.
- Switching M 3.0 / M 4.5 / M 6.0 updated state, waveform amplitude and protection labels appropriately.
- M 6.0 triggered the training-only warning screen.
- Map mock displayed 6 hospital + 6 assembly + 1 emergency-service reference markers + 1 real-like USGS event + 1 synthetic test event; test marker appeared in the separate demo layer.
- Reset removed event and map label while leaving the mock USGS catalogue intact.

### Still to verify

- Full visual interaction on iPhone and Android.
- Real browser Leaflet rendering and map pan/zoom.
- Live USGS fetch with and without network connectivity.
- Accessibility review of dialog focus and text contrast.

This is an **educational demonstration**, not an emergency response system.
