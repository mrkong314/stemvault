import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://stemvault.pages.dev',
  integrations: [sitemap()],
  output: 'static',
  trailingSlash: 'ignore',
  redirects: {
    '/tools/vce-motion-grapher': '/tools/vce-physics-grapher',
    // Retired from the Tools list; the standalone pace calculator still exists for home-screen installs.
    '/tools/pace-calculator': '/tools/pace-calculator.html',
    '/tools/palette-picker': '/tools',
  },
});
