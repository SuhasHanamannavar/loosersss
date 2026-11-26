# Checkmate — Post-Quantum Zero-Trust Identity Killswitch (Front End)

Static, Vercel-ready front end for **Checkmate**: a server-side identity killswitch
built around instant revocation and NIST ML-KEM-768 (Kyber768) post-quantum
encapsulation. Content covers the ZeroRevoke threat model, engine contract, and
the six dashboard modules. The visual language follows an Apple / macOS light
monochrome system; all copy, code, and brand artwork here are original and no
third-party source code or artwork is copied.

## Routes

| File | Purpose |
| --- | --- |
| `index.html` | Marketing field book: hero, threat model accordion, engine loop, security invariants, console module cards, footer wordmark, engine-contract reader modal |
| `dashboard.html` | Operations console with the six interactive demonstration modules |
| `404.html` | Fallback page |

## Console modules (dashboard.html)

1. Executive telemetry and KPI banner — active identities, revoked identities, protected assets, PQC engine status, 24 h authorization health.
2. Emergency Killswitch and device-loss panel — actor select, loss reason, cluster revoke trigger, propagation readout, revocation registry.
3. Live zero-trust access stream — timestamp, request ID, actor, asset, mode (`read` / `protected_read`), ALLOW / DENY badges, blocked-access callout.
4. PQC cryptographic inspector — 1184-byte public key view, ML-KEM-768 encapsulation outputs (1088 B ciphertext, 32 B shared secret, nonce, HMAC-SHA-256 proof), harvest-now-decrypt-later meter.
5. Asset ownership and access matrix — asset, owner, sensitivity tier, policy rule.
6. Audit and compliance explorer — request ID lookup, decision / rule evidence, non-disclosure check, JSON and CSV export.

## Structure

```
assets/
  css/site.css        marketing design tokens and components
  css/console.css     dashboard panels, tables, badges, KPI cards
  js/site.js          icons, nav, reveals, accordion, carousel, reader modal, particles
  js/console.js       demonstration state, live stream, revoke flow, KEM demo, audit export
  img/brand/         chess-sticker brand marks (WebP)
  icons/favicon.svg   chess-king mark
index.html
dashboard.html
vercel.json           clean URLs, long cache for /assets
```

## Design system

- Palette: Apple light surfaces `#f5f5f7` / `#ffffff`, ink `#1d1d1f`, secondary `#3a3a3c`, muted `#6e6e73`, hairline `#d2d2d7`; system red `#ff3b30` for denial / locked states. No blue, purple, or green theme tones.
- Type: Apple system stack (`-apple-system`, SF Pro Display / SF Pro Text) for UI and headlines; SF Mono / Menlo stack for labels, indices, and hex data.
- Components: translucent blurred toolbar, gray-track segmented controls with white active thumb, white hairline cards with soft shadows, black primary pills, destructive red revoke control, mono data labels, macOS-style window traffic lights on the console, hairline tables and status badges.
- Responsive: desktop 1440, laptop 1280, tablet 768, mobile 390; console grids collapse and the marketing nav becomes a toggle menu.

## Interactions

- Scroll reveals with staggered delays (reduced-motion aware).
- Threat-model accordion; invariant carousel; engine operation selector; engine-contract reader modal.
- Live stream appending decisions; revoke mutates local state and animates propagation to `0.0 ms`; subsequent revoked-actor rows deny.
- Encapsulation demo generates key material and an HMAC-SHA-256 proof via Web Crypto with a local fallback; audit lookup renders evidence rows; JSON / CSV export downloads a Blob.

## Run locally

Any static server works; no build step:

```bash
python3 -m http.server 8123
# open http://localhost:8123
```

## Deploy to Vercel

1. Push this repository to GitHub.
2. Import the repository in Vercel; framework preset: **Other (Static)**, output directory: root.
3. `vercel.json` enables clean URLs and immutable caching for `/assets`.

## Limitations

- All console values are frozen sample data; no credentials are transmitted. The backend phases (state engine, `pqcrypto.kem.kyber768` handler, CLI operations `setup` / `read` / `revoke` / `protected_read` / `audit`, `threat-model.json`) are a separate implementation phase and are not exercised by this front end.
