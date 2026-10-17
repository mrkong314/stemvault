---
name: stemvault-add
description: Add one or more resources to the StemVault catalogue from chat input. ALWAYS trigger on "/stemvault-add", and on "add a resource", "add to stemvault", "add an applet", "add a file", "add a video", "add a worksheet", "publish to stemvault", or any request to put a new teaching resource (applet, embed, file, video, quiz) into the StemVault site. Authors a schema-valid markdown entry under src/content/resources/, copies any self-hosted asset into public/, validates against the real Zod schema with a build, then commits and pushes. Batch-friendly: handles several resources in one go.
---

Add one or more resources to the StemVault Astro catalogue. Each resource becomes a markdown file in `src/content/resources/<slug>.md` whose frontmatter must satisfy the Zod schema in `src/content.config.ts`. Self-hosted assets are copied into `public/`. Everything is validated with a build, then committed and pushed together.

Always read `src/content.config.ts` first so you author against the live schema (it changes over time). Do not assume the fields below are still complete; reconcile with the actual schema before writing.

## Prerequisites (check before you start)

Run these once up front and fix any failure before authoring, so validation and publishing do not fail halfway:

- **Node 18+**: `node -v`. Astro requires `>=18.20.8`. If the version is older, stop and tell the user how to get a supported Node on PATH (for example `brew install node@20 && brew link --overwrite --force node@20`, or use nvm/fnm). Do not try to build on Node 16; it fails with "Node.js vXX is not supported by Astro".
- **Authenticated git push**: this skill commits to `main` and pushes, which deploys. Confirm push access first, e.g. `gh auth status` (if `gh` is installed) or that `git remote -v` plus credentials are in place. If auth is missing, author and validate the entry locally, then tell the user to run `gh auth login` (or set up a credential) before you push, rather than leaving a half-finished state.

## The five input paths

| Input the user gives you | `type` | URL/asset field | File handling |
|---|---|---|---|
| Self-hosted PDF / Powerpoint / Word doc | `file` | `fileUrl: <filename>` | copy the binary into `public/files/` |
| Self-hosted HTML applet (one self-contained file) | `applet` | `appletFile: <filename>.html` | copy the `.html` into `public/applets/` |
| Desmos / GeoGebra / PhET embed | `applet` | `embedUrl: <embeddable url>` | none |
| Linked video (YouTube etc.) | `video` | `embedUrl` (preferred) or `externalUrl` | none |
| Linked file (Google Drive / Form / external page) | `file` | `externalUrl: <url>` | none |

If the type is genuinely unclear, ask one short clarifying question rather than guessing.

## Frontmatter fields

Required for every entry:

- `title`: human title, as given.
- `type`: one of `applet`, `file`, `video`, `quiz` (per the table).
- `subject`: exactly one of the names in `src/data/subjects.ts` (currently `Mathematics`, `Chemistry`, `Physics`, `Biology`). Match case exactly.
- `yearLevel`: a YAML array of integers, each one of the values in `src/data/yearLevels.ts` (currently `7, 8, 9, 10, 11, 12`). Example: `[11, 12]`.
- `addedAt`: today's date in `YYYY-MM-DD`. Use the real current date, not a placeholder.

Common optional fields:

- `tags`: array of short strings. The first tag is used as the topic fallback when `topic` is absent, so order it sensibly.
- `topic`: the topic this sits under (drives the subject/topic pages). Prefer setting it explicitly.
- `description`: one or two sentences. Recommended for applets and videos.
- `sourceNote`: provenance / licensing note (used on file entries).
- `featured`: `true` only if the user asks for it. Default `false`.
- `unlisted`: `true` if the user wants it hidden from the catalogue (see Privacy). Default `false`.

Type-specific requirements enforced by the schema's `superRefine` (verify against the live file):

- `applet`: needs `embedUrl` **or** `appletFile`.
- `file`: needs `format` (`pdf` | `ppt` | `doc` | `link`) **and** (`fileUrl` **or** `externalUrl`). Use `format: link` for `externalUrl` entries; use the matching format for self-hosted files (`.pdf` -> `pdf`, `.pptx`/`.ppt` -> `ppt`, `.doc`/`.docx` -> `doc`).
- `video`: needs `embedUrl` **or** `externalUrl`.
- `quiz`: needs `appletFile`, `fileUrl`, **or** `embedUrl`.

Do not invent fields that are not in the schema. `embedUrl` and `externalUrl` are validated as proper URLs, so they must be absolute `http(s)` URLs.

### YAML safety (quote risky strings)

Frontmatter is parsed as YAML, which is strict. Always wrap string values in double quotes when the value contains any of: a colon followed by a space (`: `), a `#`, a leading `[`, `{`, `*`, `&`, `!`, `|`, `>`, `@`, `` ` ``, `%`, `"`, or `'`, or a leading/trailing space. In practice, just quote `title`, `description`, and `sourceNote` by default, since human prose routinely contains colons (e.g. `description: "Four mechanisms: diffusion, osmosis..."`). An unquoted colon makes YAML read the rest as a nested mapping and the build fails with "bad indentation of a mapping entry". Escape any literal `"` inside a double-quoted value as `\"`. Tags with spaces are fine inside the `[...]` flow list, but quote a tag if it contains a comma or colon.

## Slug

Derive a clean slug from the title: lowercase, spaces and punctuation to single hyphens, trim leading/trailing hyphens. Example: `Quadratic Explorer` -> `quadratic-explorer`. Keep it short and descriptive. If `src/content/resources/<slug>.md` already exists, append a short qualifier (subject or year) rather than overwriting, and tell the user.

## Embed URLs: use the embeddable shape, not a share page

Validate that any `embedUrl` is the form that actually renders inside an iframe. Reject plain share/landing pages and convert them when you can.

- **GeoGebra**: embeddable form is `https://www.geogebra.org/material/iframe/id/<ID>`. If given a share link like `https://www.geogebra.org/m/<ID>` or `/classic/<ID>`, convert it to the `material/iframe/id/<ID>` form.
- **PhET**: embeddable form is the simulation HTML, e.g. `https://phet.colorado.edu/sims/html/<sim-name>/latest/<sim-name>_en.html`. A catalogue/landing page like `https://phet.colorado.edu/en/simulations/<sim-name>` is not directly embeddable; convert it to the `sims/html/.../<sim-name>_en.html` form.
- **Desmos**: embeddable form is the calculator URL `https://www.desmos.com/calculator/<id>` (this iframes cleanly). A plain share page or a preview/screenshot link is not the embed URL; require the `calculator/<id>` form.
- **Video (YouTube)**: prefer the `embedUrl` form `https://www.youtube.com/embed/<id>`. If only a `watch?v=<id>` or `youtu.be/<id>` link is given and you cannot confidently rewrite it, store it as `externalUrl` instead.

If a URL does not look embeddable and you cannot safely rewrite it, ask the user for the correct embed/calculator URL rather than committing a broken iframe.

## File / asset handling

- **Self-hosted file** (`type: file`): copy the source binary into `public/files/<filename>`, set `fileUrl: <filename>` (no leading `/`; the site resolves it to `/files/<filename>`), and set `format` from the extension. Keep the original extension; give the file a clean, slug-like name.
- **Self-hosted applet** (`type: applet` with a local HTML file): the file must be a single self-contained `.html` (assets referenced by relative paths work, but a single file is the norm). Copy it into `public/applets/<filename>.html` and set `appletFile: <filename>.html`.
- **Embed / video link / linked file**: no copy. Just set the URL field.

## How applets open: the raw applet, full page

Every `applet` and `quiz` entry that has an embeddable source (`appletFile` or `embedUrl`) is linked **straight to the applet itself** from every card, list row, home-page tile and search result. A self-hosted applet opens at `/applets/<filename>.html` in the same tab (the browser Back button returns to StemVault); an `embedUrl` applet opens the provider's page in a new tab. There is no StemVault header, footer or description around it: the applet is the whole page. This is done by `resourceHref()` in `src/lib/collections.ts`, not by the entry, so there is nothing to configure per resource.

The detail page `/resources/r/<slug>` still builds for every applet and quiz (it wraps the applet in a full-page shell with an About panel) but nothing in the catalogue links to it; treat it as a fallback for old direct links. `video` entries keep linking to their boxed detail page.

Consequences for authoring:

- **Self-hosted HTML applets must stand alone as a complete page.** They are opened directly in the browser, so each needs its own `<title>`, viewport meta, and a layout that fills the window (`width: 100%`, `min-height: 100vh`/`100dvh`, internal scrolling). Do not rely on a fixed 16:10 box or a fixed pixel width; centre content with `max-width` if it should not stretch indefinitely. Give the file a clean slug-like name because the filename is visible in the address bar.
- **The applet should state its own title and brief instructions on-screen**, because the catalogue `description` is not shown alongside it. Still write a real `description`: it appears on the card, in search, and on the fallback detail page.
- Embedded third-party applets (Desmos, GeoGebra, PhET, Amplify) need nothing extra; the link opens the provider's embeddable URL in a new tab.

## Source links on detail pages

Every resource detail page (the `/resources/r/<slug>` fallback page) shows a clickable **Source** link, at the bottom of the page or inside the About panel for applets and quizzes:
- **Self-hosted applets** (`appletFile`): link shows "Download applet" and points to `/applets/<filename>.html`
- **Self-hosted files** (`fileUrl`): link shows the domain or "Download applet" and points to `/files/<filename>`
- **Embed URLs** (Desmos, GeoGebra, PhET, Amplify, etc.): link shows the domain (e.g., "desmos.com", "geogebra.org") and opens the embed in a new tab
- **External URLs** (Google Drive, Forms, YouTube, etc.): link shows the domain and opens the external resource in a new tab

No extra configuration is needed — the links are automatically generated from `embedUrl`, `appletFile`, `fileUrl`, and `externalUrl` fields.

## Validate before committing

Author all entries (and copy all assets) first, then validate against the real schema by building the site from the repo root:

```
npm install   # first run only
npm run build
```

The build runs the Zod content schema over every entry. If it reports an error for a file you just added, fix the frontmatter and rebuild until clean. Never commit an entry that fails the build. (Astro requires Node 18+; if the build complains about the Node version, use a Node 18/20 runtime.)

## Commit and push

Commit the new markdown **and** any copied asset together in one commit, then push. Git is authenticated in this environment, so commit directly (no PAT or gh connector needed).

- Stage exactly the files you created or copied (the `src/content/resources/*.md` entries plus any `public/files/*` or `public/applets/*` assets).
- Use a short, plain commit message, e.g. `Add resource: <title>` or, for a batch, `Add N resources to catalogue`. No em dashes.
- Default: commit to `main` and push, which publishes the resource. The site is `output: 'static'` and deploys to Cloudflare Pages on every push to `main`, so a push to `main` is what makes the resource live. Confirm the push succeeded and report the committed files and their URLs back to the user.
- If the user instead wants a review step, put the commit on a feature branch and open a PR against `main` rather than pushing to `main` directly. Nothing deploys until the PR is merged.

## Batch mode

The user may add several resources at once. Process each through the same steps (type -> slug -> frontmatter -> asset copy -> embed-URL check), validate them all with a single build, then commit the whole batch together (or one commit per resource if the user prefers). Report each slug and its destination URL (for applets and quizzes that is the raw applet URL, e.g. `/applets/<filename>.html`, or the `embedUrl`).

## Privacy

`unlisted: true` hides a resource from the catalogue (index, subject, topic, and search) and sets `noindex` on its detail page, but self-hosted files remain fetchable by direct URL on the public CDN/repo. For genuinely private homework, prefer a Drive/Form `externalUrl` that carries its own sharing controls.

## Optional: verify an embed actually frames

After committing an embed-backed resource, you may verify it renders. Open the resource's detail page (or the raw `embedUrl`) in Chrome and confirm the iframe loads rather than showing a blocked/refused frame, then report the result. This is optional; skip it if Chrome is unavailable.
