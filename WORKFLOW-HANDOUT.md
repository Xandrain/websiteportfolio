# LAD Website — Workflow & Tooling Handout

Reusable reference for setting up a **new** static marketing site with the same stack,
tooling, and deployment pipeline as this project. This is not about LAD's brand or
content (see `PRODUCT.md`/`CLAUDE.md`/`HANDOUT.md` for that) — it's about the plumbing:
what's installed, how the build works, how it deploys, and how AI-crawler/SEO files
are wired up.

---

## 1. The stack, in one paragraph

Plain **static HTML/CSS/JS** in `public/` — no framework, no bundler, no server runtime
in production. Content (artists, artworks, tags) is authored as **YAML** in `data/` and
compiled into HTML by a **Node build script** (`scripts/build-catalog.mjs`). A second
script (`scripts/localize.mjs`) post-processes the whole `public/` tree to add
multilingual copies, SEO metadata, `sitemap.xml`, and `robots.txt`. Deployment is
**Cloudflare Pages**, triggered by **GitHub Actions** on every push to `main`.

The project actually started from an "Aero" framework scaffold (`index.js`,
`config.json`, `pages/*.pug`, `layout/`) — that scaffold is now dead weight, superseded
entirely by the static `public/` + YAML pipeline. **Don't carry it into a new project.**
Start the new site directly with the static-site + YAML-build pattern below; skip Aero.

---

## 2. Local environment / CLIs installed

| Tool | Version seen here | Purpose |
|---|---|---|
| Node.js | v24 | Runs all build scripts |
| npm | bundled with Node | Package management, `npm run <script>` |
| `gh` (GitHub CLI) | installed, authenticated (`gh auth status`) | Repo creation, PR/issue ops from the terminal |
| `git` | — | Version control. **On this machine, plain `git push` fails silently on auth — use `git -c credential.helper=manager push`.** |
| `npx serve` | via npx, no global install | Local static file server for previewing `public/` |
| `npx wrangler` | via npx, no global install | Cloudflare Pages deploy CLI (used in CI, not needed locally unless deploying manually) |

No global installs required — everything runs through `npx` or `npm run`.

**Known gotcha:** the original Aero scaffold's `npm run dev` (via `index.js`) does not
work on Node v24 — its live-reload dependency (`uws`) doesn't have a compatible binary.
If you don't carry Aero into the new project this doesn't apply; if you do, don't rely
on `npm run dev` — always preview via `npx serve public --listen 3000`.

---

## 3. package.json — dependencies and scripts

```json
"dependencies": {
  "aero": "^2.1.0",       // legacy scaffold — unused, safe to drop in a new project
  "js-yaml": "^4.2.0",    // parses data/*.yml in the build
  "ponytail": "^1.0.57",  // small interaction library, bundled into public/js/ponytail.js
  "xlsx": "^0.18.5"       // reads the owner-facing Excel import sheet
},
"devDependencies": {
  "cheerio": "^1.2.0",    // server-side DOM manipulation, used by localize.mjs
  "esbuild": "^0.19.0"    // bundles src/js/ponytail-entry.js -> public/js/ponytail.js
}
```

Scripts:

| Script | Command | What it does |
|---|---|---|
| `catalog` | `node scripts/build-catalog.mjs` | YAML → generated HTML pages + `catalog.js`. Runs `localize.mjs` at the end. |
| `catalog:watch` | `node scripts/build-catalog.mjs --watch` | Same, rebuilds on file change |
| `import` | `node scripts/import-sheet.mjs <file.xlsx>` | Reads an Excel workbook and writes/updates `data/*.yml` |
| `import:dry` | same + `--dry-run` | Validates the workbook without writing files |
| `build` | `esbuild src/js/ponytail-entry.js --bundle ... --outfile=public/js/ponytail.js` | Bundles any interactive JS module into a single IIFE |
| `preview` | `npx serve public --listen 3000` | Local static server — **this is the actual dev workflow**, not `npm run dev` |

For a new project without the catalog/artist domain, keep the pattern (an `AUTHORED
data → build script → GENERATED public/` pipeline) but drop `import`/`catalog` if
there's no equivalent structured-content need — a lot of static sites won't need it.

---

## 4. Content pipeline pattern (if the new site has structured content)

This is the single most valuable pattern to carry over if the new site has repeating
structured content (products, portfolio items, team members, blog posts, etc.):

```
data/                    AUTHORED — source of truth, plain YAML, one file per item
  <collection>/<slug>.yml
  site.yml                 global config: enums, feature flags, site_url, analytics token
scripts/build-<x>.mjs    AUTHORED — validates + renders inline templates → public/
public/<collection>/    GENERATED — never hand-edit
```

Rules worth keeping:
- **Validation fails loudly.** The build refuses to run on a duplicate slug, an unknown
  enum value (artist/style/color equivalent), a missing required field, or a
  manually-set value that should be auto-computed. Silent bad data is worse than a
  build failure.
- **Auto-computed fields never get authored directly** — e.g. here `sold-out` /
  `almost-gone` are derived from `available`, and the build errors if you set them by
  hand in YAML. Replicate this for any state that's a pure function of other data.
  Prevents the two values ever drifting apart.
- Each collection has a `_template.yml` (e.g. `data/artists/_template.yml`) — a
  self-documenting starter file showing every field with comments. Copy that pattern
  into a new project too.
- Optional **Excel import** (`scripts/import-sheet.mjs`) is only worth carrying over if
  a non-technical owner needs to bulk-add items without touching YAML/Git. It merges
  non-blank cells over existing YAML so it never clobbers hand-added translations —
  worth keeping that merge semantic if you reuse the pattern.

---

## 5. Localization / SEO build pass (`scripts/localize.mjs`)

Runs automatically at the end of `npm run catalog`. For a new project, this is the
template for a "make the static site actually SEO- and AI-crawler-complete" pass:

1. Injects into every page `<head>`: canonical URL, `hreflang` alternates, Open Graph
   tags, Twitter Card tags, favicon links.
2. Emits translated copies of every page under `/fr/`, `/lu/` (or whatever locale
   prefixes) by walking `data-i18n` / `data-i18n-html` / `data-i18n-ph` attributes
   against a strings table — English pages stay untranslated content until a
   translation is filled in (never blocks shipping).
3. Injects `Organization` + `WebSite` JSON-LD structured data on the homepage only
   (feeds Google rich results and gives AI assistants a machine-readable identity
   record — legal name, address, founding date, RCS/company ID, social links).
4. Writes `sitemap.xml` (all locales, all generated pages) and `robots.txt`.
5. Wires in Cloudflare Web Analytics **only if** a token is present in `site.yml`
   (`cf_analytics_token`) — empty token ships zero analytics script. Keeps analytics
   opt-in and out of dev/staging builds by default.

`site_url` in `site.yml` is the single place that drives canonical URLs, hreflang, OG
tags, and the sitemap — set it once per project, never hardcode the domain elsewhere.

---

## 6. robots.txt / llms.txt — AI crawler policy

Two separate files, two separate audiences:

**`public/robots.txt`** (GENERATED by `localize.mjs` — don't hand-edit) — the
enforced version. Pattern used here:
- `User-agent: *` / `Allow: /` — everyone else welcome.
- Named **search + AI-answer bots** (Googlebot, Bingbot, ChatGPT-User, OAI-SearchBot,
  Claude-Web/User/SearchBot, PerplexityBot, DuckAssistBot) — explicitly allowed so the
  brand shows up in AI-assistant answers.
- Named **AI-training scrapers** (GPTBot, CCBot, ClaudeBot, anthropic-ai,
  Google-Extended, Applebot-Extended, meta-externalagent, FacebookBot, Bytespider,
  Diffbot, Omgilibot, ImagesiftBot) — explicitly disallowed, because the site hosts
  copyrighted creative work (artist paintings) that LAD doesn't hold training-data
  rights to.
- `Sitemap:` line pointing at the absolute sitemap URL.

**`public/llms.txt`** (hand-authored, not generated) — the informational/narrative
version per the [llms.txt convention](https://llmstxt.org/). Same allow/disallow split
as robots.txt, but includes a human/LLM-readable business summary: org name, what the
company does, key facts an AI should get right when answering questions about it,
attribution instructions, and explicit "prohibited uses" (e.g. don't misstate edition
counts, don't imply artists not in the catalogue are represented).

**For a new project:** decide first whether the site has copyrightable/proprietary
content worth blocking from AI training (photography, original writing, pricing) —
if yes, reuse this exact bot list and split. If the new site *wants* AI training
inclusion (e.g. it's documentation you want ingested), invert the training-bot section
to `Allow`.

---

## 7. Security headers & caching (`public/_headers`)

Cloudflare Pages reads a `_headers` file at the root of the deployed folder — no
Cloudflare dashboard config needed, it's checked into git.

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; base-uri 'self'; frame-ancestors 'none';
    img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self';
    script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com;
    connect-src 'self' https://cloudflareinsights.com; form-action 'self'

/assets/*
  Cache-Control: public, max-age=31536000, immutable   # fonts/logos never change filename
/css/* /js/* /data/*
  Cache-Control: public, max-age=3600                   # no content hash in filename → short TTL
```

Notes for a new project:
- The CSP has **no external font/script hosts** because fonts are self-hosted
  (`css/fonts.css` + `assets/fonts/*.woff2`) — never add a Google Fonts `<link>`, the
  CSP will block it and it'd also be a second network origin to trust.
- If you add any third-party script (analytics, forms, chat widget), its origin must
  be added to `script-src`/`connect-src` here or it silently fails under CSP.
- Immutable long-cache only applies to assets that never change under the same
  filename. Anything referenced without a content hash needs a short TTL so a deploy's
  changes actually reach visitors promptly.

`public/_redirects` is the Cloudflare Pages redirect file — plain
`<from> <to> <status>` lines, e.g. `/about/ /process/ 301`.

---

## 8. Deployment — GitHub Actions → Cloudflare Pages

`.github/workflows/pages.yml`:

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run catalog          # data/ -> public/, only if the project has this
      - run: npx wrangler pages deploy public --project-name=${{ secrets.CLOUDFLARE_PROJECT_NAME }} --branch=main
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

This deploys via `wrangler` from CI, **not** Cloudflare's own GitHub-integration
auto-deploy — meaning the build step (`npm run catalog`) runs before wrangler ever
sees the files, so Cloudflare's dashboard only needs a Pages *project* to exist, not a
connected repo.

**Required GitHub repo secrets** (Settings → Secrets and variables → Actions):
- `CLOUDFLARE_API_TOKEN` — a Cloudflare API token scoped to Pages:Edit for the account
- `CLOUDFLARE_ACCOUNT_ID` — from the Cloudflare dashboard sidebar
- `CLOUDFLARE_PROJECT_NAME` — the Pages project name (create it once via `npx wrangler
  pages project create <name>` or the dashboard, before the first CI run)

**To replicate for a new site:** create the Cloudflare Pages project, generate an API
token, add the three secrets to the new GitHub repo, copy this workflow file verbatim
(swap nothing but branch name if different), and the first push to `main` deploys it.

**Custom domain:** attached in the Cloudflare Pages project settings (dashboard) after
the first deploy — not part of the repo/CI config. DNS for the domain needs to point at
Cloudflare (either the whole zone on Cloudflare, or a CNAME if just delegating this
subdomain).

---

## 9. Cloudflare Pages Functions (serverless endpoints)

`functions/api/<name>.js` — any file here becomes a live endpoint at `/api/<name>`
automatically, no router config needed (Cloudflare Pages Functions convention: file
path = route path). Example in this repo, `functions/api/contact.js`, is now a stub
that returns `410 Gone` (the contact form was retired in favor of email/social links);
the earlier working version (Microsoft Graph-based email send) is in git history.

For a new project needing a real backend action (form submit, webhook), start a file
here — it runs on Cloudflare's edge, no separate server to deploy or manage.

---

## 10. Fonts

Self-hosted, never Google Fonts `<link>` tags:
- `public/css/fonts.css` — `@font-face` declarations
- `public/assets/fonts/*.woff2` — the actual font files, latin + latin-ext subsets

Reasons to keep this pattern: one fewer external network request/dependency, works
under a strict CSP with no extra allowed origins, and no third-party tracking via font
CDN requests. To source subset `.woff2` files for a chosen typeface, use
`google-webfonts-helper` or similar, then self-host the output.

---

## 11. AI coding-agent tooling installed in this repo

These live in the repo but are **excluded from the deployed site** via `.gitignore`
(`.claude/`, `.agents/`, `.codex/`, `.impeccable/`, `skills-lock.json`) — they're local
developer/AI tooling, not site content. Worth replicating in a new project if you'll
work on it with Claude Code again:

- **`.claude/settings.json`** — permission allowlist (which Bash/PowerShell/Skill
  invocations don't need per-call approval) plus a `PostToolUse` hook that runs a
  design-linter (`impeccable`) after every `Edit`/`Write`/`MultiEdit` on UI files and
  surfaces findings as reminders.
- **`.claude/skills/`** + **`skills-lock.json`** — pinned third-party Claude Code
  skills installed via `npx skills add <repo> --skill <name>`:
  `frontend-design` (anthropics/skills), `web-design-guidelines` (vercel-labs),
  `ui-ux-pro-max` (nextlevelbuilder), `design-taste-frontend` (Leonxlnx/taste-skill),
  `ponytail-review` (DietrichGebert/ponytail), `github-actions-docs` (xixu-me/skills),
  `find-skills` (vercel-labs/skills). `microsoft-foundry` is also present but unrelated
  to this project — likely a leftover from a different install, skip it in a new repo.
- **`.impeccable/`** — the `impeccable` design-review skill's local cache/config
  (brand register rules, live-context signals). Regenerated automatically; don't
  hand-edit.
- **`.codex/hooks.json`** — equivalent hook config for the Codex CLI, if that tool is
  also used on this project.
- **`CLAUDE.md`** (root) — the always-loaded project instructions file for Claude
  Code: navbar HTML to copy verbatim, design tokens, file map, content-model rules.
  Worth writing one of these fresh for any new project — it's the single highest
  leverage file for keeping an AI agent consistent across sessions.

None of this is required infrastructure — it's optional AI-assistant tooling. Skip
it entirely for a new project unless you specifically want the same skills/hooks.

---

## 12. Git workflow specifics for this machine

- Plain `git push` can fail on credential resolution here — use
  `git -c credential.helper=manager push origin main` (Windows Credential Manager).
- `gh` CLI is authenticated and available for repo/PR/issue operations without a
  browser round-trip.
- Commit messages in this repo do **not** include AI attribution trailers
  (no `Co-Authored-By: Claude`, no "Generated with" lines) — history was
  intentionally rewritten to purge them. Match this convention if the same
  preference applies to the new project.

---

## 13. Bootstrap checklist for a new site with this workflow

1. `npm init` — add `js-yaml`, `cheerio` (if localizing), `esbuild` (if bundling any
   JS module) as needed. Skip `aero`, `xlsx`/`ponytail` unless the new site needs
   Excel import or that specific interaction lib.
2. Create `public/` as the deploy root; write plain HTML/CSS/JS by hand for pages with
   one-off content (contact, about, etc.).
3. If there's repeating structured content: create `data/<collection>/<slug>.yml` +
   `data/site.yml`, write `scripts/build-<x>.mjs` with strict validation, wire it to
   `npm run catalog` (or equivalent name).
4. Write `scripts/localize.mjs` (or skip it if single-language) to inject canonical/OG/
   hreflang/JSON-LD and emit `sitemap.xml` + `robots.txt` — copy this project's version
   as a starting template, strip catalog-specific bits.
5. Decide the AI-crawler policy: copy `robots.txt`/`llms.txt` bot lists if the new site
   has proprietary content worth protecting from AI training; otherwise simplify.
6. Add `public/_headers` (CSP + cache rules) and `public/_redirects` as needed.
7. Self-host any custom fonts under `public/assets/fonts/` + `public/css/fonts.css`.
8. Create the Cloudflare Pages project (dashboard or `wrangler pages project create`).
9. Copy `.github/workflows/pages.yml`, add the three `CLOUDFLARE_*` secrets to the new
   GitHub repo.
10. First push to `main` → CI builds and deploys. Attach the custom domain in the
    Cloudflare Pages dashboard afterward.
11. Optionally copy `CLAUDE.md` conventions (start fresh, don't copy LAD-specific
    content) and the Claude Code skills/hooks from `.claude/` if continuing to work
    with an AI agent on the new project.
