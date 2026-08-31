// @ts-check
import { defineConfig } from 'astro/config';
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
  // Astro 7 changed this default from `true` to `'jsx'`, which strips
  // whitespace between elements by JSX rules rather than HTML rules. HTML
  // treats a newline between two inline elements as a real space, and this
  // site's markup does too — the legal notice's inline links and the About
  // card's social rows lost their word gaps under 'jsx', reflowing both pages.
  // `true` is the v6 behaviour: still minified, still HTML-correct.
  // Only move to 'jsx' alongside auditing every inline gap for an explicit
  // {" "}, which is what that mode requires.
  compressHTML: true,
  build: {
    // Inline every stylesheet into the HTML instead of a render-blocking
    // /_astro/*.css request — first paint waits only on the HTML itself. CSP
    // already allows inline styles ('unsafe-inline').
    //
    // Because the CSS is inlined into all 27 pages, anything site-wide costs
    // its bytes 27 times over — which is why Tailwind was dropped. It shipped
    // ~14 KB per page (Preflight, its custom-property machinery and the
    // utility layer) to serve about twenty classes the markup actually used.
    // Its scanner also read the CSS *property values* inside every component's
    // <style> block as class candidates, emitting utilities nothing
    // references — `.container` six times over, plus .filter, .grayscale,
    // .truncate, .ring, .shadow and friends. The tokens it held in `@theme`
    // are now plain custom properties in src/styles/global.css, and the
    // handful of real utilities are written out there by hand.
    inlineStylesheets: 'always',
  },
});
