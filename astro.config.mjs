// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // The site serves from pages.dev: haineaux.com is NOT attached to the Pages
  // project — it 403s via an old redirect to xandrain.artstation.com. `site:`
  // drives every canonical, og:url and sitemap entry, so pointing it at the
  // real host keeps that metadata truthful instead of naming a dead domain.
  // ON LAUNCH: attach haineaux.com, drop the redirect, and restore
  // 'https://haineaux.com' here in the same commit.
  site: 'https://websiteportfolio-4ht.pages.dev',
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
