# CLAUDE.md

Portfolio site for **Alexandre Haineaux** — photographer & graphic designer.
Deployed at `https://haineaux.com` via Cloudflare Pages. See
[WORKFLOW-HANDOUT.md](WORKFLOW-HANDOUT.md) for the general reusable
tooling/deploy pattern this project was bootstrapped from (that file is about
plumbing, not this site's content). [NEW-FEATURES.md](NEW-FEATURES.md)
documents the July 2026 media/authoring upgrade (auto-derived galleries,
video turnarounds, YouTube facades) in user-facing terms.

## Stack

Astro 6 (static output) + Tailwind v4 via `@tailwindcss/vite`. **Ships zero
client JS** — no React/islands; the only browser code is a handful of small
inline `<script>`s (the photography lightbox in `Lightbox.astro`, the home
gate's cursor aura, the About copy-email button in `ProfileBlock.astro`, the
video pause/reduced-motion control in `pages/productions/[slug].astro`,
the click-to-load YouTube facade in `YouTubeEmbed.astro`, and the sub-nav
same-section animation skip in `components/shared/SubNav.astro` (shared by
the thin `ProductionsSubNav.astro` / `PhotographySubNav.astro` wrappers,
which only supply tabs + aria-label) — the sticky pill tabs only play their entrance
reveal when arriving from outside the section, detected via same-origin
`document.referrer` path prefix),
which Astro inlines into the HTML. No custom YAML build
pipeline — content lives as typed TS data (`src/data/*.ts`). `npm run build` →
static output in `dist/`, deployed by `.github/workflows/pages.yml` on push to
`main`.

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
  data/photography.ts     Photography collections (typed, hand-authored array — not YAML)
  data/three-d.ts         Graphic design / 3D "productions" (same pattern; galleries auto-derived)
  lib/media.ts            Build-time folder scan → ordered production galleries (images + videos)
  lib/responsive.ts       srcset()/dims() helpers over the generated img manifests
  layouts/BaseLayout.astro  <head> — title/description/canonical/OG/Twitter, favicon, JSON-LD, sitemap link
  components/Nav.astro    Fixed pill nav (stacks + swaps to short labels on small screens)
  components/Footer.astro Site footer — index + social links, both driven by consts.ts
  components/about/ProfileBlock.astro  Static About card (glassmorphism, CSS-only reveal)
  components/productions/YouTubeEmbed.astro  Click-to-load YouTube facade (self-hosted poster)
  pages/                  photography/, productions/, about.astro, index.astro, 404.astro
scripts/
  gen-responsive.mjs      Prebuild: WebP variants + img-manifest/img-dims/img-hashes
  gen-video.mjs           GIF/capture → .webm + .mp4 + -poster.jpg (ffmpeg-static)
  fetch-yt-poster.mjs     Download a YouTube thumbnail to yt-<id>.jpg (self-hosted facade poster)
public/
  fonts/*.woff2           Self-hosted Bodoni Moda + Jost (latin subset)
  og.jpg                  Default Open Graph / Twitter share card (generated)
  apple-touch-icon.png    iOS home-screen icon (generated)
  _headers                Cloudflare Pages security headers + CSP
  robots.txt / llms.txt   AI-crawler policy (see below)
```

Brand rasters (`og.jpg`, `apple-touch-icon.png`) are regenerated from the
design tokens + fonts by `node scripts/gen-brand-assets.mjs` — swappable
defaults; edit the script or replace the files for bespoke artwork.

## Content model rules

- **Photography** (`src/data/photography.ts`): each `Collection` needs
  `slug`, `title`, `description`, `cover`, `category`, `year`, `photos[]`.
  Local images go in `public/photography/<file>` and are referenced as
  `/photography/<file>`. Each `Photo` is just `src` + `alt` — pixel dimensions
  are read from the generated `img-dims.json` via `dims()`, never hand-typed.
  The collection gallery is a ratio-preserving CSS-columns masonry (no crop,
  no JS).
- **Productions** (`src/data/three-d.ts`): each `Production` has a required
  `category` — `"productions"` or `"product-visualisation"` — which drives the
  two-tab sub-nav (`components/productions/ProductionsSubNav.astro`) and splits
  the section into two pages: `/productions` (category `productions`) and
  `/productions/product-visualisation` (category `product-visualisation`). The
  sub-nav is sticky and shown on the two listing pages only; individual
  `[slug]` project pages omit it (the category tabs are redundant there — the
  project header carries a category-aware "back" link instead).
  **Galleries are derived at build time** by `src/lib/media.ts`: every
  numbered file (`01.*`, `02.*`, …) in `public/productions/<slug>/` becomes a
  gallery item in name order — images and videos alike (a video is the trio
  `NN.webm` + `NN.mp4` + `NN-poster.jpg`, produced by `scripts/gen-video.mjs`).
  Adding/removing project media = dropping/deleting files, no data edit.
  Optional `Production` fields: `coverInGallery: true` prepends the cover as
  the first item (the product-viz convention); `images[]` forces an explicit
  order (rarely needed); `youtube: [{ id, title }]` renders click-to-load
  YouTube facades after the gallery (poster self-hosted as `yt-<id>.jpg` via
  `scripts/fetch-yt-poster.mjs`). The project page lays items out by aspect
  ratio: landscape media span the full editorial width, squarish/portrait flow
  two-up (odd runs promote a leading squarish item to full width).
  Real projects (3D modeling/rigging for
  TV, character studies, product viz) sourced from
  [artstation.com/xandrain](https://xandrain.artstation.com) — covers/images
  were originally hotlinked from ArtStation's CDN but are now **self-hosted
  copies** under `public/productions/<slug>/` (`cover.*`, `01.*`, `02.*`…).
- Site-wide copy (name, role, tagline, email, nav labels, social links) lives
  only in `src/consts.ts` — never hardcode it in a component or page. `NAV`
  items may carry an optional `short` label used by `Nav.astro` on small
  screens (e.g. "Graphic Design & 3D" → "Design & 3D").

## Images — all self-hosted (no hotlinks)

Nothing is hotlinked. Every image referenced by `src/data/*.ts` and the About
page lives under `public/` and is served from `'self'` (the CSP `img-src` is
now just `'self' data:`). Layout:

- `public/photography/<seed>.jpg` — photography covers/photos. **Still
  placeholder _content_** (downloaded from `picsum.photos`, not real
  photography) — swap these files for real work before launch; the paths and
  responsive pipeline stay the same.
- `public/productions/<slug>/{cover,01,02,…}.{jpg,webp}` — real ArtStation
  work, self-hosted. **Animation ships as video, not GIF**: the former Mojo
  SwopTops GIFs are now `NN.webm` (VP9) + `NN.mp4` (H.264 fallback) +
  `NN-poster.jpg`, ~93% smaller, rendered as muted looping `<video>` with a
  click/keyboard pause control and a `prefers-reduced-motion` fallback.
  Convert new animations with `node scripts/gen-video.mjs <file.gif>`
  (ffmpeg-static devDependency; delete the source GIF after).
- `public/about/avatar.webp` — profile avatar.

**Responsive images**: `scripts/gen-responsive.mjs` (runs on `prebuild`, or
`npm run images`) generates downscaled WebP variants next to each raster source
(`name-400.webp`, `-800.webp`, …) plus a manifest at `src/data/img-manifest.json`
and a native-dimensions map at `src/data/img-dims.json`. Components build
`srcset` via the `srcset()` helper in `src/lib/responsive.ts` (returns
`undefined` for GIFs/unknown paths, so they fall back to the plain `src`); the
`dims()` helper from the same module returns each source's intrinsic `w`/`h`
(used by the productions project page to set correct aspect ratios). To add or
replace images: drop the file in `public/…`, reference it in the data, and
re-run `npm run images`. Idempotent via content hashes
(`src/data/img-hashes.json`, committed): unchanged sources keep their variants,
a replaced source (even same filename) gets its variants regenerated and any
stale ones deleted. Hashes, not mtimes, because Explorer preserves mtime on
copy. See `UPDATING.md` for the non-developer walkthrough of routine content
updates.

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
reorder nav items there, not in the component markup. The home page (`/`)
renders no `Nav` at all (`noNav` on `BaseLayout`) — its full-screen gate
supplies its own navigation; every other page gets the translucent-light
pill.

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
attributes, the inlined `<script>`s in `Lightbox.astro` / `index.astro`, and
the JSON-LD block in `BaseLayout.astro` require it — there's no nonce/hash
pipeline on static Cloudflare Pages output). The whole `Content-Security-Policy`
value must stay on **one physical line** (Cloudflare `_headers` does not support
wrapped values). `img-src` is `'self' data:` (all images are
self-hosted — see the Images section above). `frame-src` allows exactly
`https://www.youtube-nocookie.com` for the click-to-load YouTube facade
(`YouTubeEmbed.astro`); nothing from YouTube is requested until the visitor
presses play, and facade posters are self-hosted so `img-src` stays `'self'`.
Self-hosted `<video>` needs no CSP entry (`media-src` falls back to
`default-src 'self'`). If you add any third-party script,
font, or analytics, its origin must be added here or it silently fails under CSP —
there's no dashboard-level CSP config, this file is the only source of truth.

## Deployment

**Live and wired up** (since 2026-07-14). The repo is
`github.com/Xandrain/websiteportfolio`; `.github/workflows/pages.yml` runs on
push to `main` (or manual `workflow_dispatch`): `npm ci` → `npm run build` →
`npx wrangler pages deploy dist --project-name=… --branch=main`. The three
GitHub Actions secrets are set (`CLOUDFLARE_API_TOKEN` — a least-privilege
_Cloudflare Pages · Edit_ token, `CLOUDFLARE_ACCOUNT_ID`,
`CLOUDFLARE_PROJECT_NAME=websiteportfolio`). The Cloudflare Pages project
`websiteportfolio` is **Direct Upload** (NOT Git-connected — Actions drives the
deploy) with `main` as its production branch, live at
`https://websiteportfolio-4ht.pages.dev`. Every push to `main` publishes a
production deploy. Custom-domain attachment (`haineaux.com`) still happens in
the Cloudflare dashboard, not in this repo — not yet attached.

Gotcha for setting secrets from Windows PowerShell: pipe-to-`gh` (`"val" | gh
secret set`) prepends a UTF-8 BOM that wrangler rejects (`U+FEFF` in the auth
header) — always use `gh secret set NAME --body "val"` instead.
