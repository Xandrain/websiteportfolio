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
  and its hairline ring alone will not hold against a dark or busy crop. No
  page currently bleeds artwork under it; one that does must carry paper
  down from the top behind the pill, and be re-checked at 390px, where a
  header shrinks faster than the type inside it.

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
