# CLAUDE.md

Portfolio site for **Alexandre Haineaux** — photographer & graphic designer.

## This repository is PUBLIC

`github.com/Xandrain/websiteportfolio`. Everything committed is world-readable,
including full history. Never commit credentials, machine paths, client material,
or account details. `.claude/` is gitignored and has never been pushed.

## What this is, and where edits take effect

**An Astro 6 static site. There is a real build. It runs in CI, not on your machine.**

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
  `--font-*`, `--max-width-*`, `--radius-*`), declared in `global.css`'s `@theme`.
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
- **Never quietly undo the turnaround sync.** The animated WebPs on a project page
  are phase-aligned by the script in `productions/[slug].astro`, which rests on two
  things that both look removable: `blob:` in the CSP's `img-src`, and one shared
  lap length across the set. Remove either and the page still works — the
  turnarounds just drift apart again, with nothing to show that they should not.
  The reasoning, the browser behaviour behind it and how to re-verify are in the
  comment above that script; read it before changing anything there.

## Precedence and reference

Code wins over every document. This file wins on conventions; **[UPDATING.md](UPDATING.md)**
wins on procedures and is the single reference doc — recipes, asset rules, encoding,
publishing. Read it when doing content work; this file carries only what applies to
every session.
