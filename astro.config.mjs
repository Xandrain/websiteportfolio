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
  vite: {
    build: {
      // Lightning CSS (Astro 7's minifier) prefixes AND de-prefixes against
      // this list. With no targets it assumes the newest engine everywhere
      // and collapses a prefixed/standard pair down to whichever of the two
      // was declared last — so `-webkit-backdrop-filter` beside
      // `backdrop-filter` shipped as ONE property, not two. That was
      // silently wrong in both directions: Firefox does not support the
      // `-webkit-` alias at all (verified — it computed `none` on the built
      // output), and Safari below 18 supports ONLY that alias. The nav pill,
      // the sub-nav, the contact pill and the Productions masthead all
      // frost through `backdrop-filter`, and all four were broken in one
      // engine or the other.
      //
      // The floor is chosen, not guessed. Safari must stay BELOW 18 or the
      // `-webkit-` prefix stops being generated; Chrome/Firefox must stay
      // AT OR ABOVE the versions that shipped `oklch()` (111 and 113) or
      // Lightning CSS rewrites every token in global.css into a hex
      // fallback plus a `lab()` copy, which is both lossy in intent and
      // ~600 bytes on each of the 27 inlined pages. Moving any of these
      // means re-checking both of those.
      cssTarget: ['chrome111', 'edge111', 'firefox113', 'safari16'],
    },
  },
});
