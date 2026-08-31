# haineaux.com

Portfolio site for **Alexandre Haineaux** — photographer & graphic designer.
Astro 7, static output, zero client-side JavaScript.

## How this site gets published

**There is a build, and it runs on GitHub's servers — not on your computer.**
Pushing to `main` is all you do; everything below happens automatically:

```
git push  (to main)
   │
   ├─ GitHub Actions starts        .github/workflows/pages.yml
   │    npm ci                     install dependencies
   │    npm run build              ├─ prebuild: scripts/gen-responsive.mjs
   │                               │    regenerates WebP variants + image manifests
   │                               └─ astro build → dist/
   │    npx wrangler pages deploy dist
   │
   └─ Cloudflare Pages serves dist/   ~30–45 s later
```

Cloudflare does **not** build anything. It receives an already-built `dist/`
folder by Direct Upload. That is the whole pipeline — there is no other path
to production.

## Where to edit

| You want to change… | Edit |
|---|---|
| Your name, tagline, email, nav, social links | `src/consts.ts` |
| Photography collections | `src/data/photography.ts` |
| Design / 3D projects | `src/data/three-d.ts` |
| Any photo or project image | drop the file in `public/…`, then `npm run images` |
| Page layout or design | `src/pages/`, `src/components/`, `src/styles/` |

**`src/` and `public/` are the source of truth.** `public/` is *not* generated —
every image and font in it is placed by hand and committed.

**`dist/` is disposable.** It is gitignored, rebuilt on every deploy, and must
never be hand-edited. Editing it changes nothing.

## Commands

| Command | Action |
|---|---|
| `npm install` | Install dependencies (once, per computer) |
| `npm run dev` | Preview while you work — **http://localhost:3100** |
| `npm run images` | Regenerate image variants after adding or replacing media |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the built `dist/` — http://localhost:4321 |

`npm run dev` is what you check your work against. `npm run preview` serves
whatever you last built locally, which is **not** necessarily what is live.

## Where the site actually is

Live at **https://websiteportfolio-4ht.pages.dev**.

`haineaux.com` is **not attached yet** — it still redirects to
`xandrain.artstation.com` and returns 403. `astro.config.mjs` `site:` therefore
points at the pages.dev URL on purpose, so that canonical links, share-card
metadata and the sitemap describe where the site really is. When the domain is
attached, change it back in the same commit. (Email is unaffected —
`contact@haineaux.com` routes independently of the website.)

To check that a deploy worked:

```sh
gh run list --limit 1     # green = the commit it names is live
```

## Documentation

- **[UPDATING.md](UPDATING.md)** — step-by-step recipes for every routine task:
  changing text, replacing photos, adding projects, animations, showreels, and
  publishing. Start here for content work.
- **[CLAUDE.md](CLAUDE.md)** — conventions and constraints, loaded automatically
  by Claude Code each session.

Note: this repository is **public**. Never commit credentials, machine paths, or
client material.
