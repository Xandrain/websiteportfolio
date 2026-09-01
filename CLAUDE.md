# CLAUDE.md

Portfolio site for **Alexandre Haineaux** — photographer & graphic designer.

## This repository is PUBLIC

`github.com/Xandrain/websiteportfolio`. Everything committed is world-readable,
including full history. Never commit credentials, machine paths, client material,
or account details. `.claude/` is gitignored and has never been pushed.

## What this is, and where edits take effect

**An Astro 7 static site. There is a real build. It runs in CI, not on your machine.**

    push to main
      → .github/workflows/pages.yml
      → npm ci
      → npm run build   (prebuild: scripts/gen-responsive.mjs, then astro build)
      → npx wrangler pages deploy dist --branch=main   (Direct Upload)

Cloudflare does not build; it receives an already-built `dist/`.

- **`src/` and `public/` are authoritative.** `public/` is SOURCE — every image and
  font in it is hand-placed and committed, not generated.
- **`dist/` is disposable output** — gitignored, never committed, never hand-edited.
- Only pushes to `main` deploy. Other branches deploy nothing. There are no preview
  deployments from CI. **Every push to `main` goes straight to production.**

**Serving live at `https://websiteportfolio-4ht.pages.dev`.** `astro.config.mjs`
`site:` points here deliberately, so canonicals, `og:url` and the sitemap match
reality. `haineaux.com` is NOT attached — it 403s via a redirect to ArtStation.
**On launch: attach it, drop the redirect, set `site:` back in the same commit.**
Email is unaffected (`contact@haineaux.com` routes via forwardemail.net).

**To know what is deployed** — never infer it from `npm run preview`, which serves
whatever you last built locally:

    gh run list --limit 1     # green = the commit it names is live
    git log origin/main -1

A deploy takes ~30-45s of CI plus propagation. If it fails, the live site is
unchanged — wrangler never runs if the build exits non-zero.

**To roll back a bad deploy:** dashboard rollback first, `git revert` second —
full procedure in [UPDATING.md](UPDATING.md).


## Commands

| Command | Action |
|---|---|
| `npm run dev` | Dev server, `localhost:3100` — the source of truth while working |
| `npm run images` | Regenerate WebP variants + `src/data/img-*.json` |
| `npm run build` | Production build → `dist/` (`prebuild` is byte-identical to `npm run images`) |
| `npm run preview` | Serves the built `dist/`, `localhost:4321` — NOT what is live |

`npm run build` and `npm run images` **write into the repo**. Expect a diff after either.

## Conventions

- Site-wide copy (name, role, tagline, email, nav, social) lives only in
  `src/consts.ts`. Never hardcode it in a component or page.
- Production galleries are derived from numbered files in
  `public/productions/<slug>/` (`01.*`, `02.*`…), in number order. Adding media =
  adding files; never list them in `three-d.ts`. Reserved, never gallery items:
  `cover.*`, `reel.*`, `yt-*`, `*-poster.*`, and generated `-400/-800/…webp`.
- Photos carry `src` + `alt` only — dimensions come from the generated `img-dims.json`.
- Animated turnarounds in one project must share one lap length
  (`gen-anim.mjs --cadence=150 --total-ms=3300`). The project page starts them
  on a shared beat and can only hold loops that agree on how long a lap lasts.
- No dates anywhere except the footer copyright and `/legal`.
- CSS custom properties are kebab-case with a category prefix (`--color-*`,
  `--font-*`, `--max-width-*`, `--radius-*`), declared in `global.css`'s `:root`.
- **No CSS framework.** Tailwind was removed: it shipped ~14 KB into every one
  of the 27 pages (the stylesheet is inlined) to serve about twenty classes,
  and its scanner read CSS *property values* out of component `<style>` blocks
  as class candidates, emitting utilities nothing used. Layout is hand-written
  scoped CSS per component; the only site-wide classes are in `global.css`'s
  `@layer components` — `.editorial`, `.sr-only`, `.skip-link`, `.label`,
  `.eyebrow`. Reach for one of those or write scoped CSS; do not reintroduce a
  utility framework without re-measuring what it costs per page.
- **Every content band uses `.editorial`** for its horizontal geometry
  (max-width + the 1.5/2/3rem gutter). A caller adds its own `padding-block`,
  and must use that longhand — the `padding` shorthand would silently reset
  the gutter the class just set.
- Node 22 (`.nvmrc`, CI, `engines >=22.12.0`).
- Zero client JS: no framework, no islands, only small inline `<script>`s.

## Never do this

- **Never run `scripts/self-host-images.mjs`.** A completed one-shot: it downloads
  into `public/` and rewrites `src/data/*.ts` in place. It is not inert.
- **Never encode a transparent animation as video.** ffmpeg accepts `-pix_fmt
  yuva420p` for VP8/VP9 then silently drops the alpha plane and the render ships as
  a white square. Use `scripts/gen-anim.mjs` (lossless animated WebP).
- **Never edit `dist/`**, or `src/data/img-*.json` (owned by `npm run images`).
- **Never trust `WORKFLOW-HANDOUT.md`.** It documents a different project (LAD) —
  wrong stack, wrong deploy target, and a contact function that does not exist here.
  Kept only until a copy is confirmed in the LAD repo, then deleted.
- **Never push unasked** — it deploys to production.
- **Never add a third-party script, font or analytics origin** without adding it to
  the CSP in `public/_headers`; it fails silently otherwise. The CSP value must stay
  on ONE physical line — Cloudflare `_headers` does not support wrapped values.
- **Never deny a browser feature in `Permissions-Policy` without checking the
  YouTube embed and the About card first.** A document-level `feature=()`
  overrides what an iframe may be granted, so denying anything in
  `YouTubeEmbed.astro`'s `allow` list — autoplay, accelerometer, gyroscope,
  picture-in-picture, encrypted-media, web-share, fullscreen — disables it
  inside the player with no error. `clipboard-write` is the About card's "Copy
  mail" button, and `autoplay` is also the gallery's muted looping clips. The
  list in `_headers` is deliberately restricted to features nothing here uses.
- **Never write a vendor-prefixed property AFTER its standard form**, and never
  drop `vite.build.cssTarget` from `astro.config.mjs`. Lightning CSS (Astro 7's
  minifier) treats a prefixed/standard pair as ONE property, keeps whichever
  was declared last, and regenerates prefixes from the targets. With no
  targets it de-prefixes everything; with the `-webkit-` form last it keeps
  only that. Both shipped: `backdrop-filter` in `Nav.astro`, `SubNav.astro`,
  `ContactFab.astro` and `productions/index.astro` reached Firefox as
  `none`, so all four pills rendered unfrosted there — invisible in Chrome,
  invisible in dev (which serves unminified CSS), visible only in a built
  Firefox render. Write `-webkit-*` first and the standard property last, and
  verify against `npm run preview` in a non-Chromium engine, never against
  `npm run dev`. The target floor is load-bearing in both directions — the
  reasoning is in the config comment.
- **Never set `compressHTML: 'jsx'`** (Astro 7's default, overridden to `true`
  in `astro.config.mjs`). JSX whitespace rules drop the text node between two
  inline elements, which HTML treats as a real space — under `'jsx'` the legal
  notice's inline links and the About card's social rows lost their word gaps
  and both pages reflowed. Moving to `'jsx'` means auditing every inline gap in
  the site and adding an explicit `{" "}`.
- **Never quietly undo the turnaround sync.** The animated WebPs on a project page
  are phase-aligned by the script in `productions/[slug].astro`, which rests on two
  things that both look removable: `blob:` in the CSP's `img-src`, and one shared
  lap length across the set. Remove either and the page still works — the
  turnarounds just drift apart again, with nothing to show that they should not.
  The reasoning, the browser behaviour behind it and how to re-verify are in the
  comment above that script; read it before changing anything there.
- **Never put an image under the nav pill without fading it to paper.** The
  pill is translucent by design (`Nav.astro`) so it can sit over content,
  and its hairline ring alone will not hold against a dark or busy crop.
  `/productions` is the page that does bleed artwork under it — its chapter
  bands are full-bleed and scroll up through the chrome — so
  `productions/index.astro` carries TWO fixed sibling layers, and they have
  to stay siblings — an element with a mask or a backdrop-filter is a
  Backdrop Root, so a backdrop-filter nested inside one samples only that
  ancestor's own painting and silently does nothing. `.masthead-lens`
  (`z-index: 38`) is blur only, no tint, full to 128px and gone by 184px;
  `.masthead-fade` (39) is the frost — a 20px blur with `saturate(160%)`,
  paper graduated 0.90 → 0.79 down the strip, full strength to 150px
  (clearing the sub-nav's resting bottom at ~141px) then out over 16px.
  Both sit under the sub-nav (40) and the nav (50) and over the bands. The
  lens is what lets the paper end crisply while focus keeps returning for
  another ~18px beneath it, so a band resolves out of the glass instead of
  switching — and it can run long precisely because it adds no paper. The
  saturation is load-bearing too: paper over a 20px blur desaturates a
  cover into grey mush, the opposite of the drifting colour this strip
  exists to preserve. Frosted rather than opaque is deliberate and it costs
  contrast — the inactive nav labels have less room here than on a
  flat-paper page, still clear of the 4.5 floor. Re-measure the composited
  pixels if either pill's opacity or that density curve moves. **Never fade `backdrop-filter` with a gradient
  background** — the filter cannot be graduated, so the blur would stop on a
  hard line across the viewport while the tint faded; `mask-image` is what
  attenuates both together. That mask is a defined edge, not a dissolve: the
  50px ramp it started as washed the top of the first band grey for nothing.
  Keep it in the 12–20px range — below the 20px blur radius the boundary
  starts showing as a seam on a busy crop. Any other page that
  bleeds artwork upward needs the same treatment, re-checked at 390px where
  a header shrinks faster than the type inside it. The failure is invisible
  at rest — it only shows while scrolling — so a screenshot of the top of
  the page proves nothing.

- **Swapping a `/productions` cover means re-measuring the band contrast.**
  The index sets white type straight over each crop, and the scrim stops in
  `productions/index.astro` are measured, not chosen: the palest covers
  (Crown, Rambochador) sit at roughly 4.5:1 against a 3:1 floor for the
  titles, and the phone breakpoint is tighter still because the text stacks
  against the bottom edge. A paler, brighter or busier cover can push a
  title under the floor with nothing on screen to announce it. Sample the
  composited pixels behind the text at 360/390/640/1440 and compare against
  the element's real `color` alpha — do not eyeball it, and do not trust a
  full-page screenshot, which paints the fixed fade over the whole capture
  and reports false failures.

- **Never let a second element claim `view-transition-name: site-identity`.**
  The home gate's identity card and the nav pill share that one name, which
  is what makes the card fly up and become the pill instead of the page
  cutting. `view-transition-name` must be unique among *rendered* elements
  in a document: name a third thing, or render the card and the pill on the
  same page, and the browser discards the whole morph silently — no error,
  no warning, just the old hard cut back. The declarations sit in
  `index.astro` and `Nav.astro`; the choreography has to stay in
  `global.css`, because the `::view-transition-*` pseudo-elements hang off
  the document root and an Astro-scoped selector would never match them.
  `@view-transition { navigation: auto }` is site-wide, so every same-origin
  navigation now cross-fades, not just the gate.

- **The sub-nav's black chip and a detail page's "Back to ..." pill are one
  object.** Opening a project or a collection carries the selected chip down
  to the top-left corner, where it lands as the way out; pressing it flies
  back into the bar. Same mechanism as the identity morph, and the same
  uniqueness rule bites harder, because it constrains the page's structure:
  **a detail page must not render a sub-nav.** A productions project never
  had one; a photography collection had its Collections/Gallery bar removed
  precisely so the chip could fly into its pill. Put a bar back on either and
  the pill's name gains a rival in the same document, and the browser drops
  every morph on the page silently.

  **The name is scoped per TAB, never per section** — `section-chip-productions`,
  `-product-visualisation`, `-collections` — composed in `SubNav.astro` as
  `${morphPrefix}-${active}` and matched in `productions/[slug].astro` (via
  `--back-morph`, since it varies by category) and `photography/[slug].astro`.
  That granularity does three jobs: it pairs a Product Visualisation project
  with the PV chip rather than the Productions one; it stops the
  DisciplineSwitch at the foot of a detail page ("Also explore → Photography")
  flinging the back button into another section's bar; and it is the only
  reason **switching tabs inside the bar stays an instant cut** — two tabs
  hold different names, so nothing pairs and nothing travels. Give a bar one
  section-wide name and the chip slides across the pill on every tab switch.
  `section-chip-gallery` is intentionally absent from the choreography in
  `global.css`: `/photography/gallery` has no detail page and so no pill.

  **The pill is `position: fixed` inside a full-bleed `.back-rail`**, not in
  the header flow — sticky would be bounded by the header, which scrolls
  away within one screen. The rail is full-bleed so its inner `.editorial`
  supplies the gutter rather than restating it, and carries
  `pointer-events: none` (the `.subnav` trick) or it swallows every click
  across that strip. **Its vertical position is `--back-rail-top`,
  `calc(4.75rem + 0.4rem)`** — the sub-nav's own sticky `top` plus the
  0.4rem of padding inside the bar, so the pill sits exactly where the chip
  sits once that bar is stuck, and the flight reads as a crossing rather
  than a drop. It is not a free number: change the bar's `top` or its inner
  padding and change this with them. It was `6.5rem` — the header's old top
  padding, which is a spacing value and not a position in the chrome, and it
  put the pill 40px under the nav where the sub-nav band sits at 19px.
  Aligned to nothing, it read as having fallen too far. Because the pill is
  out of flow, **the header reserves its clearance through `--back-rail-top`
  + `--back-pill-h`** — which is also why the pill is
  given a DEFINITE height rather than one derived from padding: the chip is
  a stretched flex item measuring 40px (34px ≤480px) that its own type does
  not determine, and the two ends of a morph must be the same size. Change
  the pill's height and the header's `padding-top` follows automatically;
  change either without the header reading the same variables and the fixed
  pill lands on the eyebrow.
  Do not tween the pill radius: `--radius-pill` is the 9999px sentinel, so
  the image-pair clips to a *static* one. Guarded by `prefers-reduced-motion`
  at both ends, so on a machine with OS animation effects off the pills are
  simply static — intended, not a bug.

- **Never point the identity morph’s shape tween at `--radius-pill`, and never
  drop `data-gate`.** The morph clips its box to a border-radius that travels
  with it, and both ends of that travel are traps. `--radius-pill` is 9999px —
  a sentinel meaning "fully round", not a geometry — so interpolating from it
  holds the radius above half the box height until the last percent and the
  card arrives as a stadium that pops square. Use `--radius-identity-pill`
  (2rem), which clamps to a true pill on the 43.5px nav bar and still moves.
  And a keyframe runs one way while navigation goes two: the pseudo-elements
  belong to the page being navigated TO, so `data-gate` on the gate’s `<html>`
  (set in `BaseLayout.astro`) is what runs the tween pill-to-card on the way
  back. Any new page showing the card rather than the pill needs that
  attribute, or its shape animates backwards.

## Precedence and reference

Code wins over every document. This file wins on conventions; **[UPDATING.md](UPDATING.md)**
wins on procedures and is the single reference doc — recipes, asset rules, encoding,
publishing. Read it when doing content work; this file carries only what applies to
every session.
