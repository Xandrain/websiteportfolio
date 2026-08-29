// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://haineaux.com',
  integrations: [sitemap()],
  // Dev on 3100, preview on 4321 — distinct ports so a running `astro preview`
  // (which serves the built dist/, i.e. possibly stale) can never be mistaken
  // for the live dev server.
  server: ({ command }) => ({ port: command === 'dev' ? 3100 : 4321 }),
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
