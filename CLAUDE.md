# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # dev server at localhost:3000
npm run build    # production build
npm test         # run tests (watch mode)
```

No separate lint command — ESLint runs automatically during `start` and `build` via CRA.

## What this project does

A React SPA that acts as an internal attestation reference dashboard for DPR Group. It lets staff browse, filter, and retrieve Google Drive links for past client attestations (proof-of-work documents) across two agencies: **PR Media** and **D1 Social**.

## Architecture

**Single-file React app.** All logic, components, data, and styles live in [`src/App.js`](src/App.js). There is no routing library, no state management library, and no separate component files. `App.css` contains only unused CRA boilerplate.

### Data model

All records live in [`src/data.json`](src/data.json), exported as `{ ATTS_PR, ATTS_D1 }` and imported at the top of `App.js`. `App.js` contains no hardcoded record arrays.

Each record has this shape:
```js
{ id, ann, sec, type[], m, dv, yr, mc, lbl, fid }
//     ^    ^    ^       ^   ^   ^   ^   ^    ^
// advertiser  sector  types  amount  denom  year  market-code  label  Drive file ID
```

`m` is the contract amount in MAD (can be `null`). `dv` is a display denomination string appended after the amount (e.g. `"TTC"`, `"HT"`). `fid` is a Google Drive file ID; `driveUrl(fid)` generates the view link. There is no backend.

### Theming

Two themes in `THEMES` (`PR` and `D1`) carry the accent color and brand name. The active theme object propagates to all components as a `theme` prop. Switching agency resets to the dashboard view.

### Views and components

The root `App` component holds three state values: `agency`, `view`, and `menuOpen`. It renders either:

- `Dashboard` — KPI cards + four Recharts charts (bar by advertiser, pie by service type, bar by year, radar by sector) + top-5 list
- `Search` — full-text search + multi-filter panel, grouped by advertiser, with Drive link selection modal

`AgencySwitcher` toggles between the two agencies. `Logo` renders base64-embedded PNG logos.

### Styling

- **Component-level styles**: all inline via `style={{}}` props
- **Responsive/global styles**: injected as a `<style>` tag inside `App`'s JSX, using CSS class names (`.kpi-grid`, `.chart-col`, `.search-layout`, etc.)
- Breakpoints: mobile-first, 640 px (tablet), 900 px (desktop)
- On mobile: burger menu, filter bottom-drawer. On desktop: sticky sidebar for filters, inline nav.

### Adding attestations

Add a new object to `ATTS_PR` or `ATTS_D1` in [`src/data.json`](src/data.json) following the existing shape. The dashboard and search views derive all their data from these arrays at render time via `useMemo`.
