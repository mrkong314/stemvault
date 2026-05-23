# StemVault

A static site for interactive teaching tools and STEM resources. Built with Astro, deployed to Cloudflare Pages.

## Quick start

```bash
nvm use            # Node 20
npm install
cp .env.example .env   # then edit PUBLIC_EDIT_PIN if you want
npm run dev
```

Open http://localhost:4321.

## Scripts

| command           | purpose                              |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Astro dev server with HMR            |
| `npm run build`   | Static build into `dist/`            |
| `npm run preview` | Serve the built `dist/` locally      |

## Adding content

### Applets
Create a markdown file in `src/content/applets/<slug>.md`:

```yaml
---
title: My Applet
subject: Mathematics            # Mathematics | Chemistry | Physics | Biology
yearLevel: [9, 10]
tags: [Functions, Graphing]
description: One-line summary.
# pick one:
appletFile: my-applet.html      # → /public/applets/my-applet.html
# embedUrl: https://geogebra.org/...
addedAt: 2026-05-23
---
Optional body content.
```

If using `appletFile`, drop the HTML into `public/applets/` — it's served verbatim and embedded in an iframe.

### Files
Create a markdown file in `src/content/files/<slug>.md`:

```yaml
---
title: Worksheet — Quadratics
subject: Mathematics
topic: Quadratics
type: pdf                       # pdf | ppt | doc | link
fileUrl: quadratics.pdf         # → /public/files/quadratics.pdf
# externalUrl: https://example.com/...
yearLevel: [10]
tags: [Quadratics, Worksheet]
sourceNote: Created in-house.
---
```

## Edit mode

The nav has a small lock icon. Enter the pin defined in `.env` (`PUBLIC_EDIT_PIN`) to reveal `+ Add` buttons throughout the site. Editing is UI-only — the buttons hint at what to do, but content lives in the markdown files above.

## Deploying to Cloudflare Pages

1. Push the repo to a Git remote.
2. In Cloudflare Pages → Create project → connect the repo.
3. Build settings: command `npm run build`, output directory `dist`.
4. Set `PUBLIC_EDIT_PIN` as an environment variable.
5. Update `site:` in `astro.config.mjs` to the production URL.
