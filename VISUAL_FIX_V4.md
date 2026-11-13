# Seismo Almaty — Visible Mountains & Rounded Geometric Icon Family (v4)
> **Superseded branding decision (2026-11-13):** The earlier experiment with a geometric logo was reverted at the user's request. The Seismo Almaty brand and favicon use the original seismic waveform again. The interlaced geometric medical-inspired icon is now used only for hospitals. The unused experimental brand asset was deleted. Mountain photography from this revision remains in use. See DESIGN_REFERENCE.md.

## Why this change
The user compared the existing iPhone screenshot to the approved UI. The mountain panorama was almost invisible because the previously selected **Snow covered mountains in Almaty** photo shows actual peaks hidden by heavy fog. Its thumbnail rendered as a bland grey field. The brand mark was also still the older thin oscillation-line logo.

## Real raster mountain image (no generated images)
- New source: **Sergey Zigle, _a mountain range covered in snow under a blue sky_**, Almaty, Kazakhstan, [Unsplash photo](https://unsplash.com/photos/uma-cordilheira-coberta-de-neve-sob-um-ceu-azul-WFiuUnN-3Y8), published 28 April 2023, [Unsplash License](https://unsplash.com/license).
- Source CDN: `https://images.unsplash.com/photo-1682703638082-3d975a8eec4e?auto=format&fit=crop&w=1400&q=85`.
- The mobile home now renders a real HTML `<img class="ref-hero-mountains">`, **not just an opaque CSS gradient**. The image sits between the header and status card, with a subtle blue fade, while preserving identifiable snowy peaks.
- The Instructions panorama uses the same real photograph and has `<img>` instead of the old SVG vector mountain.
- The desktop hero swaps its old vector visual for the same real photograph.
- Both image placements contain up-to-date photographer/source attribution.
- These images load from an external server, so a lack of internet/blocked CDN can still prevent them from loading; no fabricated alternate photo will be shown.

## Geometric icon family
- The user supplied a picture of an interlaced rounded eight-spoke medical symbol by a third-party designer as a visual reference.
- A **new Seismo-specific vector mark** was authored manually as SVG using softened axes/diagonal spokes and two curving central gaps. It is **inspired by the rounded geometry**, not a claim of authorship over the reference or a 1:1 brand/logo reproduction.
- The custom mark is used for mobile/desktop branding, the Monitoring quick action and an SVG site favicon. The icon family's linecaps and linejoins are rounded with consistent thicker strokes for the remaining symbols.
- Files: `assets/seismo-mark.svg`, `brand-hero-v4.css`, `index.html`, `resident/index.html`.

## Verification
- Confirmed both HTML pages include the new real photograph, new symbol, image credit, SVG favicon and final CSS load.
- HTML tag counts, JavaScript DOM element references and CSS brace balance validated.
- **Still required:** actual mobile Safari image delivery check and a screenshot comparison against the approved reference. No claim of pixel-perfect fidelity is made.
