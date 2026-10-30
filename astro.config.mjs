import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://stemvault.pages.dev',
  integrations: [sitemap()],
  output: 'static',
  trailingSlash: 'ignore',
  redirects: {
    '/tools/vce-motion-grapher': '/tools/vce-physics-grapher',
    '/tools/pace-calculator': '/tools',
    '/tools/palette-picker': '/tools',
    // Scratchpad was renamed Notepad.
    '/tools/scratchpad': '/tools/notepad.html',
  },
});
