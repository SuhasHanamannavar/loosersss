# Sylva — Woodland Field Study Front End

A static, Vercel-ready front end built around the Sylva "living green" woodland
concept: mossy forest atmosphere, editorial type, pill navigation, floating
field cards, scroll-driven chapters, and a dark procedural-scene entry point.

The implementation is original code with generated nature imagery. Public
reference pages were studied for layout, typography rhythm, spacing, and
interaction patterns only; no third-party source code, 3D scenes, video clips,
or marketing images were copied into this repository.

## Routes

| File | Purpose |
| --- | --- |
| `index.html` | Main landing: grove hero, restoration journey, field-note story, voices, participation plans, closing wordmark |
| `living-green.html` | Dark misty hero variant with floating ethos / field-note cards and stats |
| `world.html` | Living-world scene entry with drifting dust particles and pointer parallax |
| `sting.html` | Two-line motion-study statement ("It grows back.") |
| `habitats.html` | Four habitat cards: moss carpet, creek line, old growth, clearing |
| `journal.html` | Field-note index with dated observation rows |
| `ethos.html` | Ethos statement and three working principles |
| `404.html` | Fallback trail page |

## Structure

```
assets/
  css/styles.css      design tokens and all components (single stylesheet)
  js/main.js          nav, reveals, counters, particles, parallax, quote carousel
  img/                generated nature photography (moss, ferns, forest, creek)
  icons/favicon.svg   sprouting-mark favicon
index.html … 404.html
vercel.json           clean URLs, long cache for /assets
```

## Design system

- **Palette**: moss `#6f9448`, bright moss `#8fbf5f`, fern `#496a33`, bark `#3a2f21`,
  warm paper `#f0eee5`, dark forest `#131a0f`, fog `#9aa38a`. No blue or purple tones.
- **Type**: Inter (display, tight tracking) + JetBrains Mono (uppercase labels, stats, indices).
- **Components**: pill segmented nav, ghost pill buttons, circular play/arrow buttons,
  warm-white floating cards, stat chips, chapter index labels, pricing cards, quote carousel.
- **Breakpoints**: desktop 1440, laptop 1280, tablet 768, mobile 390; mobile menu collapses to a toggle.

## Interactions

- Mobile menu toggle and active-segment states
- Scroll-triggered reveals (IntersectionObserver) with staggered delays
- Count-up stats (canopy restored, native species)
- Drifting pollen / dust particle canvas on dark scenes (reduced-motion aware)
- Pointer parallax on hero backgrounds
- Quote carousel with prev / next controls and index readout
- Smooth anchor scrolling with fixed-header offset

## Run locally

Any static server works:

```bash
python3 -m http.server 8123
# open http://localhost:8123
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repository in Vercel; framework preset: **Other (Static)**; output directory: root.
3. No build step required — plain HTML/CSS/JS with long-lived cached `/assets`.

## Notes and limitations

- The reference's proprietary Three.js scene files, preview videos, and artwork are not included;
  atmosphere is reproduced with layered photography, CSS gradients, and a lightweight canvas particle layer.
- Testimonials and pricing labels are illustrative placeholders for layout review.
- The ZeroRevoke backend modules (state engine, PQC handler, service CLI, audit contract) are a separate
  backend phase and are intentionally not part of this front-end deliverable.
