import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://stemvault.pages.dev',
  integrations: [sitemap()],
  output: 'static',
  trailingSlash: 'ignore',
  redirects: {
    '/tools/vce-motion-grapher': '/tools/vce-physics-grapher',
  },
});
