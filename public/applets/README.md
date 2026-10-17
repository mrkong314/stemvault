# /public/applets

Drop self-contained HTML applets in this folder. Each file is served verbatim at `/applets/<filename>` and can be referenced from an applet markdown entry via:

```yaml
appletFile: my-applet.html
```

Use relative paths for any assets the HTML loads (e.g. `./scripts/...`). Catalogue links open the applet file directly in the browser (full page, no site chrome), so it must be a complete standalone page with its own `<title>` and viewport meta.

Size the applet to its viewport (`width: 100%`, `min-height: 100vh`/`100dvh`) and let it scroll internally rather than assuming a fixed box.
