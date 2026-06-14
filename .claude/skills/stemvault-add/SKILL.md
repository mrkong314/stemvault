---
name: stemvault-add
description: Add one or more resources to the StemVault catalogue from chat input. ALWAYS trigger on "/stemvault-add", and on "add a resource", "add to stemvault", "add an applet", "add a file", "add a video", "add a worksheet", "publish to stemvault", or any request to put a new teaching resource (applet, embed, file, video, quiz) into the StemVault site. Authors a schema-valid markdown entry under src/content/resources/, copies any self-hosted asset into public/, validates against the real Zod schema with a build, then commits and pushes. Batch-friendly: handles several resources in one go.
---

Add one or more resources to the StemVault Astro catalogue. Each resource becomes a markdown file in `src/content/resources/<slug>.md` whose frontmatter must satisfy the Zod schema in `src/content.config.ts`. Self-hosted assets are copied into `public/`. Everything is validated with a build, then committed and pushed together.

Always read `src/content.config.ts` first so you author against the live schema (it changes over time). Do not assume the fields below are still complete; reconcile with the actual schema before writing.

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
- Push to the current branch. Confirm the push succeeded and report the committed files back to the user.

The site is `output: 'static'` and deploys to Cloudflare Pages on push, so a successful push is what publishes the resource.

## Batch mode

The user may add several resources at once. Process each through the same steps (type -> slug -> frontmatter -> asset copy -> embed-URL check), validate them all with a single build, then commit the whole batch together (or one commit per resource if the user prefers). Report each slug and its destination URL.

## Privacy

`unlisted: true` hides a resource from the catalogue (index, subject, topic, and search) and sets `noindex` on its detail page, but self-hosted files remain fetchable by direct URL on the public CDN/repo. For genuinely private homework, prefer a Drive/Form `externalUrl` that carries its own sharing controls.

## Optional: verify an embed actually frames

After committing an embed-backed resource, you may verify it renders. Open the resource's detail page (or the raw `embedUrl`) in Chrome and confirm the iframe loads rather than showing a blocked/refused frame, then report the result. This is optional; skip it if Chrome is unavailable.
