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
    // Phone-first tools open as their own full page, never framed. These keep the old framed URLs working.
    '/tools/calculator': '/tools/calculator.html',
    '/tools/class-timer': '/tools/class-timer.html',
    '/tools/rep-timer': '/tools/rep-timer.html',
    '/tools/random-picker': '/tools/random-picker.html',
    '/tools/notepad': '/tools/notepad.html',
    // Scratchpad was renamed Notepad.
    '/tools/scratchpad': '/tools/notepad.html',
  },
});
