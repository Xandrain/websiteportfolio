# CLAUDE.md

Portfolio site for **Alexandre Haineaux** — photographer & graphic designer.
Deployed at `https://haineaux.com` via Cloudflare Pages. See
[WORKFLOW-HANDOUT.md](WORKFLOW-HANDOUT.md) for the general reusable
tooling/deploy pattern this project was bootstrapped from (that file is about
plumbing, not this site's content).

## Stack

Astro 6 (static output) + React islands (`@astrojs/react`) for interactive
pieces (e.g. `ProfileBlock.tsx`) + Tailwind v4 via `@tailwindcss/vite`. No
custom YAML build pipeline — content lives either as typed TS data
(`src/data/*.ts`) or Astro content collections (`src/content/journal/*.md`).
`npm run build` → static output in `dist/`, deployed by
`.github/workflows/pages.yml` on push to `main`.

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Local dev server, `localhost:4321` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the built `dist/` output |

## File map

```
src/
  consts.ts               SITE / NAV / SOCIAL — single source for site-wide copy & nav links
  content.config.ts       Astro content collection definitions (journal)
  content/journal/*.md    Journal posts — frontmatter: title, description, date, draft, tags
  data/photography.ts     Photography collections (typed, hand-authored array — not YAML)
  data/three-d.ts         Graphic design / 3D "productions" (same pattern)
  layouts/BaseLayout.astro  <head> — title/description/canonical/OG/Twitter, favicon, sitemap link
  components/Nav.astro    Fixed pill nav, transparent-on-home variant (see below)
  components/Footer.astro Site footer — index + social links, both driven by consts.ts
  pages/                  photography/, productions/, journal/, about.astro, index.astro, 404.astro
public/
  fonts/*.woff2           Self-hosted Bodoni Moda + Jost (latin subset)
  sequences/<slug>/       WebP frame sequences for the 3D "productions" viewer
  models/*.glb            3D model assets
  _headers                Cloudflare Pages security headers + CSP
  robots.txt / llms.txt   AI-crawler policy (see below)
```

## Content model rules

- **Photography** (`src/data/photography.ts`): each `Collection` needs
  `slug`, `title`, `description`, `cover`, `category`, `year`, `photos[]`.
  Local images go in `public/photography/<file>` and are referenced as
  `/photography/<file>`.
- **Productions** (`src/data/three-d.ts`): each `Production` has a required
  `category` — `"productions"` or `"product-visualisation"` — which drives the
  two-tab sub-nav (`components/productions/ProductionsSubNav.astro`) and splits
  the section into two pages: `/productions` (category `productions`) and
  `/productions/product-visualisation` (category `product-visualisation`). The
  sub-nav is sticky and shown on both listing pages and every `[slug]` project
  page (active tab = the project's category; the "back" link is category-aware).
  Each `Production` optionally has a `sequence` (WebP frame folder under
  `public/sequences/<slug>/`, zero-padded 4-digit filenames, e.g. `0001.webp`)
  for the interactive scrub viewer, or a plain `images[]` array. Don't hand-add
  both unless the component supports it. Real projects (3D modeling/rigging for
  TV, character studies, product viz) sourced from
  [artstation.com/xandrain](https://xandrain.artstation.com) — covers/images
  were originally hotlinked from ArtStation's CDN but are now **self-hosted
  copies** under `public/productions/<slug>/` (`cover.*`, `01.*`, `02.*`…).
- **Journal** (`src/content/journal/*.md`): frontmatter is validated by the
  Zod schema in `content.config.ts` — `title`, `description`, `date`, `draft`
  (default `false`), `tags` (default `[]`). A post with `draft: true` should
  be filtered out at the page level before it ships.
- Site-wide copy (name, role, tagline, email, nav labels, social links) lives
  only in `src/consts.ts` — never hardcode it in a component or page.

## Images — all self-hosted (no hotlinks)

Nothing is hotlinked. Every image referenced by `src/data/*.ts` and
`ProfileBlock.tsx` lives under `public/` and is served from `'self'` (the CSP
`img-src` is now just `'self' data:`). Layout:

- `public/photography/<seed>.jpg` — photography covers/photos. **Still
  placeholder _content_** (downloaded from `picsum.photos`, not real
  photography) — swap these files for real work before launch; the paths and
  responsive pipeline stay the same.
- `public/productions/<slug>/{cover,01,02,…}.{jpg,webp,gif}` — real ArtStation
  work, self-hosted. Animated GIFs (e.g. Mojo SwopTops) are kept as GIFs.
- `public/about/avatar.jpg` — profile avatar.

**Responsive images**: `scripts/gen-responsive.mjs` (runs on `prebuild`, or
`npm run images`) generates downscaled WebP variants next to each raster source
(`name-400.webp`, `-800.webp`, …) plus a manifest at `src/data/img-manifest.json`.
Components build `srcset` via the `srcset()` helper in `src/lib/responsive.ts`,
which returns `undefined` for GIFs/unknown paths so they fall back to the plain
`src`. To re-add images: drop the file in `public/…`, reference it in the data,
and re-run `npm run images` (idempotent — existing variants are reused).

The one-shot `scripts/self-host-images.mjs` recorded how the originals were
pulled down and repointed (kept for reference; not part of the build).

## Fonts

**Bodoni Moda** (display, `--font-display`) + **Jost** (sans/body,
`--font-sans`) — a high-fashion didone serif paired with a geometric sans
(the "Luxury Minimalist" pairing). Self-hosted (not Google Fonts `<link>`
tags) — `src/styles/fonts.css` declares `@font-face` for both typefaces from
`public/fonts/*.woff2` (latin subset only), imported at the top of
`src/styles/global.css`. Design tokens (`--font-display`, `--font-sans`) live
in `global.css`'s `@theme` block. Weights shipped: Bodoni Moda 400/500/700 +
400 italic; Jost 300/400/500. Reason for self-hosting: works under a strict
CSP with no external font origin, one fewer network round-trip, no
third-party request. If a new weight/style is needed, pull it from
`https://gwfh.mranftl.com/api/fonts/<font-id>` (returns direct
`fonts.gstatic.com` woff2 URLs per weight) rather than re-adding a Google
Fonts `<link>`.

## Nav / Footer

Both are driven entirely by `NAV`/`SOCIAL` in `src/consts.ts` — add or
reorder nav items there, not in the component markup. `Nav.astro` has a
`site-header--home` variant (transparent dark overlay, used only on `/`) vs.
the default translucent-light pill used everywhere else; toggled by
`Astro.url.pathname === "/"`, not a prop.

## AI-crawler / SEO policy

- `public/robots.txt` — allows general crawling and named AI-answer bots
  (ChatGPT-User, Claude-Web/User/SearchBot, PerplexityBot, DuckAssistBot,
  etc.); explicitly disallows AI-**training** scrapers (GPTBot, CCBot,
  ClaudeBot, Google-Extended, Applebot-Extended, Bytespider, etc.) because
  the site hosts original creative work with no training-data rights granted.
- `public/llms.txt` — hand-authored, human/LLM-readable summary + usage
  policy per the [llms.txt convention](https://llmstxt.org/). Update the
  "key facts" section if role/location/contact changes.
- `sitemap.xml` is generated automatically by `@astrojs/sitemap`
  (`astro.config.mjs`) from `site: 'https://haineaux.com'` — don't hand-write
  it, and update `site` there if the domain ever changes (it drives
  canonical URLs and OG tags too, via `BaseLayout.astro`).

## Security headers (`public/_headers`)

CSP is `default-src 'self'` with narrow allowances: `style-src`/`script-src`
include `'unsafe-inline'` (Astro scoped `<style>` + inline `style=""`
attributes and small inline `<script>`s in `Lightbox.astro` /
`SequencePlayer.astro` require it — there's no nonce/hash pipeline on static
Cloudflare Pages output). `img-src` is `'self' data:` (all images are
self-hosted — see the Images section above). If you add any third-party script,
font, or analytics, its origin must be added here or it silently fails under CSP —
there's no dashboard-level CSP config, this file is the only source of truth.

## Deployment

`.github/workflows/pages.yml` runs on push to `main`: `npm ci` → `npm run
build` → `npx wrangler pages deploy dist`. Requires three GitHub repo secrets
(`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_PROJECT_NAME`) —
not yet configured as of this writing; the Cloudflare Pages project itself
also still needs to be created (dashboard or `wrangler pages project
create`) before the first CI deploy will succeed. Custom domain attachment
happens in the Cloudflare dashboard, not in this repo.
