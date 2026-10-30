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

All catalogue entries live in `src/content/resources/<slug>.md` and are validated against the Zod schema in `src/content.config.ts`. The `/stemvault-add` skill in `.claude/skills/` walks through the full procedure; the short version:

```yaml
---
title: "My Applet"
type: applet                    # applet | quiz | file | video
subject: Mathematics            # Mathematics | Chemistry | Physics | Biology
yearLevel: [9, 10]
topic: "Functions"              # drives the subject/topic pages (falls back to the first tag)
tags: ["Functions", "Graphing"]
description: "One-line summary."
# applet / quiz: appletFile: my-applet.html   -> public/applets/my-applet.html
#                embedUrl: https://...        -> GeoGebra / PhET / Desmos embed form
# file:          format: pdf | ppt | doc | link, plus fileUrl (public/files/) or externalUrl
# video:         embedUrl (YouTube embed form) or externalUrl
addedAt: 2026-05-23
---
Optional body content, shown in the About panel.
```

Applets and quizzes open the raw HTML full page; files link straight to the file; videos get a detail page under `/resources/r/<slug>`.

## Front-end structure

| path | purpose |
| --- | --- |
| `src/styles/global.css` | design tokens and shared primitives (`.btn`, `.card`, `.tag`, `.crumbs`, `.page-head`, `.type-badge`) |
| `src/layouts/BaseLayout.astro` | document shell: header, footer, edit-mode script, `fullPage` mode |
| `src/layouts/ResourceLayout.astro` | sidebar + main grid for everything under `/resources` |
| `src/layouts/ToolLayout.astro` | heading + iframe shell for the framed tools under `/tools` |
| `src/components/resources/FullPageEmbed.astro` | edge-to-edge applet shell with About / New tab / Fullscreen bar |
| `src/components/filters/FilterPanel.astro` | sidebar or inline filter UI; logic in `src/scripts/filters.ts` |
| `src/lib/collections.ts` | all resource queries and link rules (`resourceHref`, `embedSrc`, topics) |

## Edit mode

The nav has a small lock icon. Enter the pin defined in `.env` (`PUBLIC_EDIT_PIN`) to reveal `+ Add` buttons throughout the site. Editing is UI-only — the buttons hint at what to do, but content lives in the markdown files above.

## Deploying to Cloudflare Pages

1. Push the repo to a Git remote.
2. In Cloudflare Pages → Create project → connect the repo.
3. Build settings: command `npm run build`, output directory `dist`.
4. Set `PUBLIC_EDIT_PIN` as an environment variable.
5. Update `site:` in `astro.config.mjs` to the production URL.
