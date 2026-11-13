# UI v3 — approved mobile reference implementation

This revision is based on the user's **last approved Seismo Almaty 8-screen mockup**, not just its colors. The mockup is the visual acceptance target. Browser-only code cannot prove pixel-perfect reproduction without side-by-side screenshots of the rendered site; **do not claim 1:1 QA until that comparison is done**.

## Changes implemented

- **Home:** compact aligned header with round 43 px controls, documentary raster snow-mountain background, weather chip with observed/modelled current Open-Meteo data (fallback "—°"), reference-like green source-connectivity card and four white tiles with **circular** icon wells. User name is optional and saved only in localStorage.
- **Map:** minimized header with two circular filter/layer controls; category selection moved to popover rather than permanently stealing map height. White Bottom Sheet starts hidden and opens when a map marker is tapped. A dedicated close button dismisses the card. Reference-like earthquake summary uses magnitude, depth, relative distance and prominent detail action. Real geolocation appears only with browser permission.
- **Markers:** real earthquake red dot + halo; hospital blue circle + medical icon; preliminary assembly point green people icon; services purple shield; user blue ring, and a separate purple **TEST** simulation marker. Map layers remain independent.
- **Events:** each row has a wave icon circle, magnitude title, region, time + depth and chevron. USGS catalogue unchanged.
- **Event detail:** icon-led event card, large magnitude, metric rows with icons, warning about interpreting USGS event data.
- **Assembly places:** six real, source-linked Wikimedia Commons landmark photographs from the prior implementation, not AI images. No unverified hospital or MCHS photo has been invented.
- **Instructions:** photo panorama, before/during/after segmented tabs, small themed instruction icons, compact cards.
- **Profile:** reference-style compact settings; the long editable local form opens only when tapped.
- **Simulation:** preserves separate IoT tutorial scenarios while sharing the same neutral pale-blue design vocabulary. No fake physical feedback or claims of real actuator control.
- **Alert:** red explicit *training-only* interface remains, not triggered by USGS.

## Image provenance and weather

**Mountain hero and instruction panorama:** [Snow covered mountains in Almaty (Unsplash).jpg](https://commons.wikimedia.org/wiki/File:Snow_covered_mountains_in_Almaty_(Unsplash).jpg), Nursultan Rakysh, photo from 2016, CC0 (published before the Unsplash 2017 license change). This is a real raster photograph. The CSS applies a translucent blue layer for legibility, with no generated imagery. It is an **alternative photo**, not the original pixel-by-pixel backdrop from the mockup. The photograph is requested as an optimized Wikimedia Commons file through `Special:FilePath`; network access is needed to display it.

**Current weather:** [Open-Meteo forecast API](https://open-meteo.com/en/docs), query for current `temperature_2m,weather_code,is_day` near central Almaty, Asia/Almaty timezone. Nothing is invented when the endpoint is offline. The displayed city-level conditions are model-based, not a building-level thermometer reading.

**Place photography:** see [PHOTO_CREDITS.md](PHOTO_CREDITS.md). The photos show landmarks historically, not guaranteed current condition, safety or official assembly status.

## Safety

Green card means **USGS feed successfully loaded**, not "earthquake risk low". USGS event catalogue is retrospective. There is no operational early warning, real earthquake prediction or verified evacuation route. On-device SIMULATION records are visually distinct from USGS events. Building states are simulated labels.

## QA completed (code-level)

- All 105 HTML IDs are unique, 56 JavaScript `getElementById` references point to existing nodes.
- Tags in the principal HTML template are balanced.
- JavaScript syntax parses, CSS braces balance, root and `/resident/` asset paths resolve relative to their directories.
- Mocked browser execution tested online/offline USGS and Open-Meteo states, correct mock temperature `+13°`, truthful offline fallback `—°`, six hospital and six assembly map markers, category popover opening, initially hidden map card, icon-backed event rows, icon detail rows, and M 6.0 triggering the training-only view.
- The six real landmark images and visible attribution were tested previously in a mocked DOM.

## QA not yet completed

Live mobile Safari/Android Chrome rendering, actual Wikimedia image delivery and Open-Meteo browser fetch, comparison against the mockup at pixel level, interaction testing with screen readers and long labels at all device widths. Those require a real browser or device preview. Do not call the design pixel perfect before this.
