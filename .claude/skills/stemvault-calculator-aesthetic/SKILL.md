---
name: stemvault-calculator-aesthetic
description: Build or restyle a self-contained HTML applet, quiz or simulation in the StemVault house style, the liquid-glass aesthetic shared by the StemVault website and the Calculator tool (system font, cool light palette, near-black dark mode, translucent glass panels over an ambient colour field, iOS-style segments, switches and pill buttons). ALWAYS trigger on "/stemvault-calculator-aesthetic", and on "calculator aesthetic", "stemvault style", "match the site style", "in the StemVault aesthetic", "like the calculator", "glass style applet", or any request to make an applet, quiz, simulation or practice page that should look like it belongs on StemVault. Also use when restyling an existing applet to match. For phone-first, home-screen-installable tools in the Class Timer style use stemvault-class-timer-aesthetic instead.
---

Produce a single self-contained `.html` file that looks native to StemVault: the same tokens, surfaces and controls as the website and the Calculator tool. Files in this folder are the source of truth; read them before writing any markup:

- `tokens.css`: the complete token set plus base styles and the reusable control classes. Paste it verbatim into the applet's first `<style>` block. Do not rename variables, drop the dark block, or invent new colours.
- `template.html`: a starter page with the glass top bar, mode segment, settings popover (theme + a switch) and a stage/side layout. Start from it and delete what the applet does not need.
- Live references, for anything the template does not cover: `public/tools/calculator.html` (desktop glass, settings panel, keypad) and `src/styles/global.css` (the website's version of the same tokens).

## The look, in one paragraph

System font (`-apple-system … Roboto`), never a webfont. Headings are bold with tight tracking; labels are small, bold, uppercase, grey. Light mode is a cool off-white with three soft ambient colour blobs behind translucent white glass; dark mode is near-black (`#0a0a0c`) with the same blobs in deep blue, purple and green behind dark glass. One accent, system blue, for the primary action, selected state and links; green for on/success, amber for warnings, red for destructive. Panels are 18px-radius glass with a hairline border and an inner top highlight. Controls are iOS-shaped: 11px-radius buttons, a segmented control for modes, a switch for booleans, a stepper for small integers, pill-shaped chips for tags. Depth comes from the glass, not from heavy shadows or gradients on the content itself.

## Rules

1. **One file, no network.** Everything inline. No CDN scripts, no Google Fonts, no external images; inline SVG for icons. A `<canvas>` or inline SVG for diagrams. The applet is served from `/applets/` inside the site and also opened full page, so it must stand alone.
2. **Use the tokens for every colour.** Any new colour needed for data (graph series, chemistry element groups, segment fills) is declared as a `--var` in the same `:root` block with a dark-mode counterpart, and should be drawn from the iOS system palette: blue `#0a84ff`, green `#30d158`/`#34c759`, orange `#ff9f0a`, red `#ff453a`, purple `#bf5af2`, pink `#ff375f`, teal `#64d2ff`, indigo `#5e5ce6`, yellow `#ffd60a`.
3. **Theme follows the system and can be pinned.** Keep the `prefers-color-scheme` block and the `[data-theme]` overrides. Include the Appearance segment (Auto / Light / Dark) in a settings popover and persist the choice in `localStorage`. Never read `prefers-color-scheme` in JS to pick colours; let CSS variables do it. Canvas drawing reads `getComputedStyle(document.documentElement).getPropertyValue('--ink')` and friends so it re-themes.
4. **Layout.** A sticky glass `.topbar` with title and a one-line sub-label on the left, mode segment in the middle, settings gear on the right. Below it, a `.app` container at most 1100px wide (620px for single-column tools), glass `.panel`s with 12px gaps. On screens under 860px, stack to one column. Respect `env(safe-area-inset-*)` for padding so the page sits well when embedded or installed.
5. **Controls.** Primary action: `.gbtn.pill`. Secondary: `.gbtn`. Link-coloured tertiary: `.gbtn.ghost`. Destructive: `.gbtn.danger`, and arm it (first tap turns it red and reads "Tap again", auto-disarms after 3 s) rather than using `confirm()`. Modes: `.seg` with `.on`. Booleans: `.switch` with `aria-checked`. Small counts: `.stepper`. Text and number inputs: `.field`. Minimum tap target 44px.
6. **Maths and numbers.** Tabular numerals for anything that changes (`.num`). Units in `--ink-dim`. For typeset maths prefer plain HTML/CSS with `--font-math`; if a formula engine is genuinely needed, inline it rather than loading it from a CDN. Physics values to 3 significant figures unless the task says otherwise.
7. **Feedback.** Correct answers in `--good`, incorrect in `--danger`, hints in `--ink-dim` on `--surface`. Use a `.toast` for transient messages. Keep sound optional behind a switch and generate it with the Web Audio API, no audio files.
8. **State.** One `state` object, saved to `localStorage` under a versioned key (`'<slug>-v1'`), loaded with `Object.assign` so new fields get defaults. Never store personal data beyond what the user typed into the tool.
9. **Accessibility.** Real `<button>`s, `aria-live="polite"` on the result stage, `role="tablist"`/`"tab"` on mode segments, visible focus rings (the tokens provide them), `prefers-reduced-motion` respected.
10. **Mobile.** 16px minimum font size on inputs for touch devices (tokens handle it), `touch-action: manipulation`, no horizontal scroll at 375px wide.

## Procedure

1. Read `tokens.css` and `template.html`. If the request is to restyle an existing applet, read that file in full first and keep its logic, ids and storage key intact; only replace the styling layer and align markup to the control classes.
2. Write the applet as `<slug>.html` in the place the user asked for, or `public/applets/<slug>.html` in the StemVault repo at `/Users/nickminit/Claude/Claude Code/stemvault` when it is being added to the site.
3. Check both themes: open the file, toggle Appearance to Light and Dark, and confirm every colour comes from a token (search the file for `#` literals outside the `:root` blocks and justify each one).
4. Check it at 375px wide and at 1280px wide. No horizontal scroll, controls reachable, stage readable.
5. If it is going into the catalogue, hand off to `/stemvault-add` (type `applet` or `quiz`, `appletFile: <slug>.html`, `category: practice` or `game` where that applies) rather than editing the content collection by hand.

## Checklist before finishing

- Tokens pasted unchanged; no webfonts; no external requests.
- Topbar + settings popover with Appearance segment; theme persisted.
- Light and dark both checked; canvas/SVG re-colours on theme change.
- Primary action is a blue pill; destructive actions are armed, not `confirm()`ed.
- 44px tap targets; 375px layout clean; reduced motion respected.
- Versioned `localStorage` key; state survives reload.
