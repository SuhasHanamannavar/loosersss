# Checkmate — Post-Quantum Zero-Trust Identity Killswitch (Front End)

Static, Vercel-ready front end for **Checkmate**: a server-side identity killswitch
built around instant revocation and NIST ML-KEM-768 (Kyber768) post-quantum
encapsulation. Content covers the ZeroRevoke threat model, engine contract and
the operations console. The visual language follows an Apple / macOS light
monochrome system; the app console adapts SaaS-workspace patterns (Resend /
Clerk-style sidebar, resource tables, key modal, tabbed SDK) while keeping the
Checkmate theme unchanged. All copy, code and brand artwork are original; no
third-party source code or artwork is copied.

## Routes

| File | Purpose |
| --- | --- |
| `index.html` | Marketing field book (unchanged): hero, threat model accordion, engine loop, security invariants, console module cards, footer wordmark, engine-contract reader modal |
| `dashboard.html` | Operations board launcher: six module cards (telemetry, killswitch, stream, inspector, matrix, audit) that link out to their dedicated split pages; keeps legacy anchor ids `#kpis`, `#killswitch`, `#stream`, `#inspector`, `#matrix`, `#audit` |
| `console.html` | App console · Overview: executive telemetry, recent verified decisions, engine status, containment scenarios A / B / C |
| `identities.html` | Identity roster: trusted / locked filters, search, profile modal, one-click revoke with reason wizard |
| `assets.html` | Protected assets envelope store: tier badges, policy rules, protect-asset modal, sealing walkthrough |
| `killswitch.html` | Emergency revocation console: actor wizard, reason, zero-window propagation, signed revocation registry, containment checklist, offline-freeze facts |
| `security.html` | PQC cryptographic inspector: 1184 B public key, encapsulation outputs, HMAC proof, suite parameters, harvest-now margin, invariants |
| `logs.html` | Live decision stream + audit evidence lookup with ALLOW / DENY filters and JSON / CSV export |
| `integrations.html` | Control-plane API keys, Python / Node guard SDK tabs, CLI contract terminal, AI drop-in agent prompt |
| `settings.html` | Multi-tenant isolation, team, engine configuration, audit retention, danger zone |
| `404.html` | Fallback page |

## App console shell

`assets/css/app.css` layers over `assets/css/console.css` and adds the workspace
shell: persistent left sidebar (Monitor / Protect / Develop / Workspace groups,
hairline-separated like Resend-style workspaces), sticky blurred topbar with
search field, Production / Test segmented control and sync status, page headers
with a solid black primary action top-right, stat cards, resource tables, filter
tabs, modals, terminal code blocks, launcher cards, scenario cards, facts and
timeline lists, and a danger zone. `assets/js/app.js` provides the shared icon set, active-nav state, mobile
drawer, generic tabs / modals / copy controls, the demo revocation model
(localStorage-persisted disabled set), identity and asset rendering, killswitch
flow, stream generator, KEM demo, audit export and key generation.

### Module map (`dashboard.html` launcher → dedicated pages)

One function per page; the old six-panel single board was split into the following dedicated console views:

1. Executive telemetry → `console.html` — active identities, revoked identities, protected assets, PQC engine status, 24 h authorization health.
2. Emergency killswitch and device-loss panel → `killswitch.html` — actor select, loss reason, cluster revoke trigger, propagation readout, signed revocation registry.
3. Live zero-trust access stream → `logs.html` — timestamp, request ID, actor, asset, mode (`read` / `protected_read`), ALLOW / DENY badges, blocked-access callout.
4. PQC cryptographic inspector → `security.html` — 1184-byte public key view, ML-KEM-768 encapsulation outputs (1088 B ciphertext, 32 B shared secret, nonce, HMAC-SHA-256 proof), harvest-now-decrypt-later meter.
5. Asset ownership and access matrix → `assets.html` — asset, owner, sensitivity tier, policy rule.
6. Audit and compliance explorer → `logs.html#audit` — request ID lookup, decision / rule evidence, non-disclosure check, JSON and CSV export.

## Structure

```
assets/
  css/site.css       marketing design tokens and components (landing page)
  css/console.css    shared console design tokens and legacy component classes
  css/app.css        app workspace shell, sidebar, launcher cards and shared components
  js/site.js         marketing icons, nav, reveals, accordion, carousel, reader modal
  js/console.js      retained legacy board script (reference only; not loaded by the launcher)
  js/app.js          app console: shell, demo model, roster, assets, killswitch, logs, SDK, settings
  img/brand/         chess-sticker brand marks (WebP)
  icons/favicon.svg  chess-king mark
index.html
console.html · identities.html · assets.html · killswitch.html
security.html · logs.html · integrations.html · settings.html
dashboard.html
vercel.json          clean URLs, long cache for /assets
```

## Design system

- Palette: Apple light surfaces `#f5f5f7` / `#ffffff`, ink `#1d1d1f`, secondary `#3a3a3c`, muted `#6e6e73`, hairline `#d2d2d7`; system red `#ff3b30` for denial / locked states. No blue, purple or green theme tones.
- Type: Apple system stack (`-apple-system`, SF Pro Display / SF Pro Text) for UI and headlines; SF Mono / Menlo stack for labels, indices and hex data.
- Components: translucent blurred toolbar, gray-track segmented controls with white active thumb, white hairline cards with soft shadows, solid black primary pills, destructive red revoke control, mono data labels, macOS window traffic lights on terminal panels, hairline tables and status badges.
- Responsive: desktop 1440, laptop 1280, tablet 768, mobile 390; the app sidebar collapses to a drawer under 1080 px; console grids collapse under 1080 / 720 px.

## Interactions

- Landing page: scroll reveals, threat-model accordion, invariant carousel, engine operation selector, engine-contract reader modal.
- App console: sidebar active state, mobile drawer, provision / revoke / protect / key-generation modals, filter tabs and search, toast feedback, copy buttons, tabbed SDK panels.
- Revocation mutates the local demonstration model (disabled set persisted in `localStorage`); roster, registry, sidebar count and stream decisions update; propagation animates to `0.0 ms`.
- KEM demo generates key material and an HMAC-SHA-256 proof via Web Crypto with a local fallback; audit lookup renders evidence rows; JSON / CSV exports download a Blob.

## Run locally

Any static server works; no build step:

```bash
python3 -m http.server 8123
# open http://localhost:8123/console.html
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repository in Vercel; framework preset: **Other (Static)**, output directory: root.
3. `vercel.json` enables clean URLs and immutable caching for `/assets`.

## Limitations

All console values are frozen or randomized demonstration data; no credentials
are transmitted and no live backend calls are made. The backend phases (state
engine, `pqcrypto.kem.kyber768` / `ml_kem_768` handler, CLI operations
`setup` / `read` / `revoke` / `protected_read` / `audit`, control-plane
`/api/sync`) are a separate implementation phase and are not exercised here.
