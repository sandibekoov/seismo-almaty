# Seismo Almaty

Mobile-first educational UI for seismic event monitoring and building-safety simulations in Almaty.

## Interfaces

- **Resident website and mobile web UI:** [GitHub Pages](https://sandibekoov.github.io/seismo-almaty/) — Home, Map, Events, Instructions, Profile.
- **Engineering demonstration:** `/engineering/` — original Arduino/Flex Sensor visualisation, simulated emergency shutdown, SOS demonstration, oscilloscope.
- **Preview:** `/resident/` — copy of the resident UI served from a subpath.

## Live vs simulated features

| Feature | Status |
| --- | --- |
| USGS GeoJSON earthquake catalogue for 500 km around Almaty | Live retrieval on the client; requires connection to USGS |
| Magnitude, depth, date and epicentre | From the fetched USGS event catalogue |
| Earthquake prediction, building safety certification, authoritative public alerting | **Not implemented** and must not be claimed |
| Named parks/squares (potential assembly landmarks) | Hard-coded **unverified demo points** carried over from the original code |
| Verified safe evacuation routes | Not implemented |
| Local profile and manually entered/geolocated coordinates | Saved only in localStorage on the current device |
| Engineering sensors, automatic response, SOS | **Simulation only** in `/engineering/`. SOS is not actually sent |
| Android APK / Windows EXE in repository | Legacy builds; **not automatically updated** when the website changes |


## Strict mobile design reference

The approved eight-screen light-blue mobile direction is recorded in [DESIGN_REFERENCE.md](DESIGN_REFERENCE.md). The implementation uses a dedicated [reference-ui.css](reference-ui.css) layer and local vector [Almaty mountain artwork](assets/almaty-mountain-art.svg) to preserve the reference composition across phones. This SVG is an approximation of the photographic mountain illustration in the approved mockup; a pixel-for-pixel visual check on real mobile devices is still outstanding.

Responsive resident pages: Home, Map, Events, Event Details, Places, Instructions, Profile, and explicitly-labelled Training Emergency. Engineering console remains separate at `/engineering/`.

## UI / UX

- Matches the approved light-blue Seismo Almaty mobile direction, with a restrained desktop adaptation.
- Four mobile navigation destinations; standalone safety-instructions page.
- Data loading and connection failures are separate from any assertion of physical safety.
- No automatic emergency modal from delayed USGS catalogue data.
- Emergency view is user-initiated and clearly labelled **training only**.
- Layered Leaflet map with event details and labelled unverified points.
- `Manrope` typography; responsive 320–1440 px CSS; reduced-motion support; keyboard focus styles.

## File structure

`index.html` — resident UI
`site.css` — responsive styles
`site.js` — pages, USGS API, Leaflet map, filtering, storage, demo
`resident/index.html` — subfolder preview
`engineering/index.html` — legacy engineering simulator
`ui.css` — legacy engineering theme

## Development & checks

Serve the folder using a static HTTP server, e.g. `python -m http.server 8080`, and open `http://localhost:8080/`.

Recommended test scenarios:
1. 390 × 844 mobile: all four tabs and safe-area bottom navigation.
2. Desktop 1440 × 900: home hero and cards, full map with controls.
3. USGS online vs offline: accurate loading / unavailable status, never false "safe" promises.
4. Map toggles, event selection, details modal, Escape to close.
5. Filters by days and magnitude; empty-result state.
6. Instructions before/during/after; demo drill open/close.
7. Profile coordinates saving and map marker after opt-in geolocation.
8. `/engineering/` legacy page continues to function.

This is a student prototype. It is not an earthquake early warning system, a public alert service or a certified building protection system.
