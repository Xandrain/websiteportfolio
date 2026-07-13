// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://haineaux.com',
  integrations: [sitemap()],
  build: {
    // Inline every stylesheet into the HTML (~12 KB gzip/page) instead of a
    // render-blocking /_astro/*.css request — first paint waits only on the
    // HTML itself. CSP already allows inline styles ('unsafe-inline').
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
