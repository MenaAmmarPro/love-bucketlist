# Our List — Love for Mena

Everything we've said we'd do together — far-off trips and tiny things alike —
ticked off one by one. Part of the **Love for Mena** collection.

**Live:** https://menaammarpro.github.io/love-bucketlist/

## What it does

- Eight **starter ideas** across four categories: places, food, together,
  small things
- Tick items off and watch the **progress bar** fill up
- **Filter** by category
- Add your own, or remove anything
- Reset back to the original list
- Everything stays on the device — no tracking, no network calls
- Installable PWA with offline support

## How it works

Items live in localStorage under `mena-bucketlist`. The starter set is in the
`STARTER` array at the top of `js/app.js`.

## Files

- `index.html` — the page
- `css/theme.css` — shared love-theme (copied from `_love-theme/`)
- `css/app.css` — page-specific styles (progress, filters, rows)
- `js/theme-main.js`, `js/effects.js` — shared behaviour/effects
- `js/app.js` — list logic
- `manifest.webmanifest`, `sw.js` — PWA
- `assets/` — favicon and icons

## Run locally

```powershell
py -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy

Static site, deployed with GitHub Pages from `main`.

## License

Creative Commons BY-NC-ND 4.0 — see [`LICENSE`](LICENSE).
© 2026 Ammar (MenaAmmarPro). Made with care for Mena.
