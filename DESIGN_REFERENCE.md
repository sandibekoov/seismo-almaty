# Seismo Almaty — approved UI reference (strict)

**Status:** mobile direction approved by the project owner, 12 November 2026.  
**Single source of visual truth:** the image in the project's chat showing eight mobile screens in a blue/white Seismo Almaty UI board. The source PNG/JPEG is **not embedded** here; compare with the image from the discussion during final visual QA.

The mobile design must be treated as a **layout reference**, not merely an inspiration for colors.

## Never regress to the generic desktop dashboard

The earlier implementation shared the palette but not the composition. Mobile screens must look like a deliberate native-style product, **not** desktop cards squashed into one column. No glassmorphism overload, no dark technical control room for residents, no random extra controls, no decorative UI that implies functionality.

The engineering simulator stays in `/engineering/`, visually separate.

## Visual foundations

- Background: cool light blue, approx. `#EAF2FF` / `#EEF5FF`.
- Paper/card surface: `#FFFFFF`; subtle, restrained blue-grey shadows.
- Main blue: `#1769ED`. Success green, warning amber, emergency red only as statuses.
- Typography: Manrope with compact bold headings, strong readability; no huge web-hero headings on phones.
- Rounding: primary cards about 17–23 px; buttons around 13–16 px; circular icon controls.
- Spacing system: 4/8/12/16/24 px. Keep 44×44 px or larger interactive touch targets.
- Mountain art: panoramic Almaty mountains and tower in blue tones, integrated behind the mobile greeting and used as a restrained instructions accent. A **separate editable SVG asset** is kept in `assets/almaty-mountain-art.svg`. The original reference has a more photographic rendering; this vector is a self-contained approximation, not pixel-perfect source artwork.

## Screen requirements

| Screen | Layout contract |
| --- | --- |
| Home | Small logo + two circular actions → greeting over mountains → pale green/blue connectivity status card → exactly four equal rounded shortcut tiles → recent event cards → fixed four-tab bottom navigation. |
| Map | Compact header/back → horizontal scrolling chips by category → nearly fullscreen interactive map → distinct icon+color markers → floating legend → rounded bottom information sheet → bottom navigation. |
| Events | Compact header → short filter chips → clean chronological cards with clear magnitude badges → bottom navigation. |
| Event details | Compact back header → magnitude/region/date → metric rows (distance, depth, epicenter, source) → warning about uncertainty. A real USGS event is not the same as a predictive alert. |
| Assembly places | Compact header → unverified-status notice → large white rows with thumbnail, name, location/distance if available, verification warning, chevron. |
| Instructions | Compact back header → before/during/after segment control → mountain panorama → readable list of actions. |
| Profile | Compact header → avatar summary → setting rows with icons → optional address/coordinates editor. |
| Emergency/training | A **separate red screen** with a high-contrast warning triangle and clear safety steps, **explicitly labelled a training simulation**, never automatic from delayed USGS data. |

### Navigation

Mobile uses **Home / Map / Events / Profile** as the four fixed bottom destinations. Other screens open from these and have clear back navigation. The bottom bar respects iOS/Android safe-area insets and must not cover interactive map controls.

### Data honesty / safety

- The USGS public event catalogue is retrospective information, **not** early warning or prediction.
- Never display "Спокойная" as a verified city-wide safety judgement based on a non-authoritative USGS feed. A green card may only indicate that the **source data loaded successfully**, with explicit wording.
- Hospital locations and assembly landmarks are preliminary demonstration points from the original simulator, not checked facilities/routes; display this status.
- Never draw an unverified straight-line route and call it safe walking directions.
- Emergency numbers and SOS must not be misrepresented as a real dispatch.
- No fake weather, clock, real-time counts, injury or sensor measurements.


## Additional course-approved workflow — IoT Simulation Mode

Accessible through Profile (and Instructions). An extra screen in the same reference-style light-blue visual language contains three test scenarios, a deliberately synthetic signal trace, a scenario-status card, demo building-state labels, and links to the map/events. Map pins are purple and explicitly labelled TEST; event history has a separate SIMULATION card. The source feed and USGS event counters remain unchanged. M6 opens the explicitly labelled training-only red screen. Details: [IOT_SIMULATION.md](IOT_SIMULATION.md).

## Acceptance checklist

1. Check reference match visually at 390 × 844 and 375 × 812; then 320, 360, 430 and 768 px.
2. Verify mobile hero stays compact with status + four actions before recent events.
3. Inspect all eight screens, with long place names and unavailable USGS states.
4. Ensure category icons remain legible at 100% zoom and are not indistinguishable colored circles.
5. Verify full map pan/zoom, map filter chips, object sheet, card content, close/back behavior.
6. Verify the fixed nav does not cover the map sheet or SOS training close action.
7. Test real browser DOM rendering, Safari and Android Chrome where possible.
8. Re-check keyboard navigation, focus visibility, reduced motion and status text contrast.

**Implementation verification:** Static JavaScript syntax and DOM-ID checks were performed during authoring. Real-device screenshots / pixel-by-pixel reference comparisons require a browser and have not yet been completed.


## Final brand / map-icon decision (2026-11-13)

The brand logo is the **original blue seismic waveform** (mobile header, desktop header, Monitoring shortcut and favicon). It must **not** be replaced with the medical interlaced emblem. The interlaced rounded multi-spoke medical emblem is reserved for **hospital markers** and the hospital filter only. Earthquake, assembly, emergency service and demo markers use their own recognizable, round, bold-stroke pictograms on consistently-sized colored circular pins. Real-user location retains its blue locator-dot halo. Hospital coordinates remain preliminary; this is not verified emergency navigation.
