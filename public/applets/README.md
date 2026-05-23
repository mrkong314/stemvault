# /public/applets

Drop self-contained HTML applets in this folder. Each file is served verbatim at `/applets/<filename>` and can be referenced from an applet markdown entry via:

```yaml
appletFile: my-applet.html
```

Use relative paths for any assets the HTML loads (e.g. `./scripts/...`). The applet runs inside an iframe on the StemVault site, so it must work standalone.
