# StemVault

A static site for interactive teaching tools and STEM resources. Built with Astro, deployed to Cloudflare Pages from `main`.

## Quick start

```bash
nvm use            # Node 20
npm install
npm run dev
```

Open http://localhost:4321.

## Scripts

| command           | purpose                              |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Astro dev server with HMR            |
| `npm run build`   | Static build into `dist/`            |
| `npm run preview` | Serve the built `dist/` locally      |

## Site map

| route | what it shows |
| --- | --- |
| `/` | hero with counts, the three quick tools, subjects band, recent resources |
| `/resources` and `/resources/<subject>/<topic>` | the catalogue with sidebar filters (subject, year, type, category, tags) |
| `/practice` | practice banks grouped by year and subject |
| `/tools` | the standalone tools from `src/data/tools.ts` |
| `/resources/r/<slug>` | fallback detail page for every resource (videos link here; applets and quizzes open raw) |
| `/search-index.json` | what the header search reads (resources plus tools) |

## Adding content

Catalogue entries live in `src/content/resources/<slug>.md` and are validated against the Zod schema in `src/content.config.ts`. The `/stemvault-add` skill in `.claude/skills/` walks through the full procedure; the short version:

```yaml
---
title: "My Applet"
type: applet                    # applet | quiz | file | video  (quiz = anything self-marking)
subject: Mathematics            # Mathematics | Chemistry | Physics | Biology
yearLevel: [9, 10]
topic: "Functions"              # reuse an existing topic name where one fits
category: practice              # optional: practice (bank) | game
tags: ["Functions", "Graphing"]
description: "Two or three sentences: what it does, how a class would use it, which year."
# applet / quiz: appletFile: my-applet.html   -> public/applets/my-applet.html
#                embedUrl: https://...        -> GeoGebra / PhET / Desmos / Amplify embed form
# file:          format: pdf | ppt | doc | link, plus fileUrl (public/files/) or externalUrl
# video:         embedUrl (YouTube embed form) or externalUrl
addedAt: 2026-05-23
---
Optional body content, shown in the About panel.
```

Applets and quizzes open the raw HTML full page, so every file in `public/applets/` must be a complete standalone page (see `public/applets/README.md`). Files link straight to the file. Videos get a detail page under `/resources/r/<slug>`. Practice banks (`category: practice`) also appear on `/practice`, and their titles end with " - Practice Bank".

## Tools

`src/data/tools.ts` lists every tool shown on `/tools`, and `QUICK_TOOLS` picks the three shown in the header and on the home page. The phone-first tools (Calculator, Notepad, Class Timer, Rep Timer, Random Picker) are standalone PWAs in `public/tools/` with their own manifest and icons, and always open as their own page; the old framed URLs such as `/tools/calculator` redirect to the `.html` file (see `redirects` in `astro.config.mjs`). The VCE graphers and circuit maker are desktop applets framed by `FullPageEmbed` from pages in `src/pages/tools/`.

## Front-end structure

| path | purpose |
| --- | --- |
| `src/styles/global.css` | design tokens (Calculator liquid-glass aesthetic, light and dark) and shared primitives (`.btn`, `.card`, `.tag`, `.seg`, `.switch`, `.crumbs`, `.page-head`, `.type-badge`) |
| `src/layouts/BaseLayout.astro` | document shell: meta, theme bootstrap, header, footer, `fullPage` mode |
| `src/layouts/ResourceLayout.astro` | sidebar + main grid for everything under `/resources` |
| `src/components/resources/FullPageEmbed.astro` | edge-to-edge applet shell with About / New tab / Fullscreen bar |
| `src/components/filters/FilterPanel.astro` | sidebar or inline filter UI; logic in `src/scripts/filters.ts` |
| `src/scripts/search.ts` | fuzzy header search over `/search-index.json` |
| `src/lib/collections.ts` | all resource queries and link rules (`resourceHref`, `embedSrc`, topics) |
| `src/data/` | subjects and accents, year levels, tools |

## Design skills

`.claude/skills/stemvault-calculator-aesthetic/` (applets and quizzes in the site style) and `.claude/skills/stemvault-class-timer-aesthetic/` (phone-first installable tools) each hold a `SKILL.md`, `tokens.css` and `template.html`. New applets should start from the matching template so they match the catalogue.

## Deploying to Cloudflare Pages

Pushes to `main` deploy automatically. Build command `npm run build`, output directory `dist`. `public/_redirects` and `public/_headers` are picked up by Pages. If the domain changes, update `site:` in `astro.config.mjs` and the sitemap URL in `public/robots.txt`.
