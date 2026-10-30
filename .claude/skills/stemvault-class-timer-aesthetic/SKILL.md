---
name: stemvault-class-timer-aesthetic
description: Build or restyle a phone-first, home-screen-installable teaching tool in the StemVault app style used by Class Timer, Rep Timer and Random Picker (glass top bar clear of the iOS status bar, OLED-black dark mode, rounded tabular digits, iOS segments, switches and armed delete buttons, bottom sheets, on-device state, web manifest and icons). ALWAYS trigger on "/stemvault-class-timer-aesthetic", and on "class timer aesthetic", "like the class timer", "class timer style", "phone tool", "installable tool", "home-screen app", "make it a PWA for StemVault", or any request for a timer, picker, tracker or classroom utility that teachers will run on a phone or project on a screen. For applets and quizzes embedded in the catalogue use stemvault-calculator-aesthetic instead.
---

Produce a single self-contained `.html` tool that behaves like Class Timer: it opens full screen with no site chrome, installs to a phone home screen with its own icon, reads cleanly under the iOS status bar, and runs from on-device state. Files in this folder are the source of truth; read them before writing any markup:

- `tokens.css`: the app profile of the StemVault tokens plus the control classes (`.gbtn`, `.seg`, `.switch`, `.stepper`, `.digits`, `.sheet`, `.toast`). Paste it verbatim into the tool's first `<style>` block.
- `template.html`: starter page with the head metadata for installation, the sticky top bar with settings popover, a mode segment, a big readout stage, an armed reset button, Web Audio beep and a wake-lock helper.
- Live references in the repo at `/Users/nickminit/Claude/Claude Code/stemvault`: `public/tools/class-timer.html` (pinned header, scrolling timer stack, bottom sheets, big display mode, bell times, cold-call picker), `public/tools/rep-timer.html` (single huge readout with progress bar and spoken cues), `public/tools/random-picker.html` (canvas wheel, list editor, results). Read the closest one in full when the request resembles it.

## How this differs from the website / Calculator style

Same light palette, fonts and control shapes as `stemvault-calculator-aesthetic`, but tuned for a phone in a classroom:

- **Dark mode is pure OLED black.** No ambient gradient, no translucent tint, hairline borders only. The primary pill button is outlined blue on black rather than filled, so nothing glows. Dark is the default `state.theme` because these tools are usually projected or glanced at.
- **One column, 620px max.** Everything stacks; the important readout is huge (`.digits`, SF Rounded, tabular numerals) and the controls below it are 44px or taller. Secondary editors (lists, bell times, settings that need space) open in a bottom `.sheet`, not inline.
- **Installable.** Manifest, 180/192/512 icons, `apple-mobile-web-app-*` metas, `viewport-fit=cover`, `interactive-widget=resizes-content`, no zoom. The top bar's top padding is `calc(10px + env(safe-area-inset-top) * 1.25)` because the glass status bar on iOS 26 softens text sitting right under it; do not reduce that multiplier.
- **Works offline and keeps state.** No network requests at all. One `state` object in `localStorage` under a versioned key; class lists, logs and settings never leave the device. Say so in the description.
- **Keeps the screen on while running** (`navigator.wakeLock`) and makes sound only with the Web Audio API, created on the first user gesture, behind a Sound switch.

## Rules

1. One file, inline everything, no CDN, no webfonts, inline SVG icons.
2. Colours only through the tokens. Data colours come from the iOS system palette (blue `#0a84ff`, green `#30d158`, orange `#ff9f0a`, red `#ff453a`, purple `#bf5af2`, pink `#ff375f`, teal `#64d2ff`, yellow `#ffd60a`) and get a `--var` in `:root`.
3. Top bar: title plus a one-line `.sub` that states the current mode or status; settings gear on the right opening a `.popover` with Appearance (Auto / Light / Dark) and the tool's switches.
4. Modes as a full-width `.seg` directly under the top bar. Booleans as `.switch` with `aria-checked`. Counts as `.stepper`. Destructive actions are armed (`.remove.armed`, "Tap again", auto-disarm after 3 s), never `confirm()`.
5. The page itself should not scroll when the tool is a live readout (timer, picker): pin header and stage, scroll only the list region. Lists of many items (timers, names) scroll inside their own container.
6. A "big display" or fullscreen mode is expected for anything projected: drop the chrome, scale the readout to the viewport, `Esc` or a corner button exits.
7. Text inputs 16px on touch, `touch-action: manipulation`, no horizontal scroll at 375px.
8. **Layout by input device, never by orientation.** The base styles are the phone layout and apply to phones in both orientations. A wider layout (two columns, side-by-side readout and list) is added only under `@media (pointer: fine) and (min-width: 900px), (pointer: none) and (min-width: 900px), (min-width: 1000px)`: a mouse or trackpad at 900px+ in any window shape, or a tablet in landscape. The one exception is a big display mode, which may use `(min-width: 760px) and (orientation: landscape)` because it describes the screen being projected to, not the device in hand. Short viewports use `max-height` queries only.
9. Accessibility: real buttons, `aria-live="polite"` on the readout, `role="switch"`/`"tab"` where used, visible focus rings, reduced motion respected.

## Procedure

1. Read `tokens.css`, `template.html` and the closest live tool. For a restyle, read the existing file in full and keep its logic, ids and `STORE` key.
2. Write `public/tools/<slug>.html` in the repo (or the path the user names).
3. Make the icon: author `<slug>-icon.svg` (512 viewBox, 104px-radius rounded square, the green `#2b7a63` to `#174a3c` gradient used by the existing tools, a white 34px-stroke glyph), then rasterise and resize:
   ```bash
   qlmanage -t -s 512 -o . <slug>-icon.svg && mv <slug>-icon.svg.png <slug>-icon-512.png
   sips -z 192 192 <slug>-icon-512.png --out <slug>-icon-192.png
   sips -z 180 180 <slug>-icon-512.png --out <slug>-icon-180.png
   ```
   Put the PNGs in `public/tools/`, embed the SVG base64 as the favicon, and remove the loose SVG.
4. Write `public/tools/<slug>.webmanifest` copying `class-timer.webmanifest` with the new name, description, `start_url` and icons (`display: standalone`, `scope: /tools/`, black background and theme colour).
5. Register it: add an entry to `src/data/tools.ts` and either a `src/pages/tools/<slug>.astro` using `ToolLayout` (framed, with `fullscreenHref` to the raw file) or a redirect page like `scratchpad.astro` if it should only ever open full page.
6. Check light and dark and the installed-app inset (open with the mobile viewport and confirm the title clears the top). Then check the layout by device, not by window shape: phone portrait (402×874, touch), phone landscape (874×402, touch), tablet landscape (1180×820, touch), laptop wide (1300×800, mouse), laptop tall window (800×1100, mouse), laptop narrow window (600×900, mouse). Phones must keep the single column in both orientations; the laptop wide and tablet landscape cases get the wider layout if the tool has one. Run `npm run build`, then commit and push from the repo.

## Checklist before finishing

- Tokens pasted unchanged; OLED dark; outlined pill in dark.
- Head metadata complete: manifest, apple-touch-icon, theme-colours, app-capable metas, no-zoom viewport.
- Top bar padding uses the 1.25× inset multiplier.
- State persisted under a versioned key; nothing sent anywhere.
- Sound behind a switch, Web Audio only; wake lock while running.
- Armed destructive buttons; 44px targets; no horizontal scroll at 375px.
- Layout chosen by `pointer:` queries; no `orientation:` outside big display; phones single-column both ways.
- Icons (180/192/512) and webmanifest in `public/tools/`; entry in `tools.ts`; page route exists.
