# /public/applets

Drop self-contained HTML applets in this folder. Each file is served verbatim at `/applets/<filename>` and can be referenced from an applet markdown entry via:

```yaml
appletFile: my-applet.html
```

Use relative paths for any assets the HTML loads (e.g. `./scripts/...`). The applet runs inside an iframe on the StemVault site, so it must work standalone.

Applets open full page on the site: the iframe fills the viewport below the header, so size the applet to its viewport (`width: 100%`, `min-height: 100vh`/`100dvh`) and let it scroll internally rather than assuming a fixed box.
