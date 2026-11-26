# Checkmate — Post-Quantum Zero-Trust Identity Killswitch (Front End)

Static, Vercel-ready front end for **Checkmate**: a server-side identity killswitch
built around instant revocation and NIST ML-KEM-768 (Kyber768) post-quantum
encapsulation. Content covers the ZeroRevoke threat model, engine contract, and
the six dashboard modules. The visual language studies an editorial moss/paper
reference for layout rhythm, spacing, and motion; all copy, code, and imagery here
are original and no third-party source code or artwork is copied.

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
  img/                original moss / forest photography used as atmosphere plates
  icons/favicon.svg   chess-king mark
index.html
dashboard.html
vercel.json           clean URLs, long cache for /assets
```

## Design system

- Palette: warm paper `#f3f2e9`, night forest `#18221c` / `#202c22`, moss `#4a6a3a` / `#8fbf5f`, brick status `#b05545`. No blue or purple tones.
- Type: Lexend (display, light weights, tight tracking) + JetBrains Mono (labels, indices, hex data).
- Components: pill segmented nav, metal-rim pill controls, floating cream cards, chapter index labels, accordion threat rows, invariant carousel, module plan cards, giant footer wordmark, dark console panels with mono tables and status badges.
- Responsive: desktop 1440, laptop 1280, tablet 768, mobile 390; console grids collapse and the nav becomes a toggle menu.

## Interactions

- Scroll reveals with staggered delays; drifting dust particles on dark bands (reduced-motion aware).
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
