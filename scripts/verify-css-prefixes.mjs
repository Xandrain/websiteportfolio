/**
 * Build gate: a prefixed/standard CSS pair written in `src/` must still be a
 * pair in the built output.
 *
 * WHY THIS EXISTS. Lightning CSS (Astro 7's minifier) treats a
 * prefixed/standard pair as ONE property and keeps whichever was declared
 * LAST, regenerating prefixes from `vite.build.cssTarget`. A component that
 * writes the standard property first and `-webkit-` second therefore ships
 * only the `-webkit-` form. Firefox supports no `-webkit-backdrop-filter`, so
 * the surface renders unfrosted there — with no error, no warning, nothing
 * visible in Chromium, and nothing visible in `npm run dev`, which serves
 * unminified CSS. It shows up only in a built render in another engine.
 *
 * It happened twice. `Nav`, `SubNav` and `ContactFab` were fixed when it was
 * first found; `ProfileBlock` (x2) and `Lightbox` kept writing the standard
 * form first and shipped `-webkit-`-only long afterwards. A rule in CLAUDE.md
 * did not prevent the second occurrence. This does.
 *
 * HOW IT DECIDES WHAT TO CHECK. The set of properties to police is derived
 * from `src/`, not hard-coded: a property is "meant to be paired" only if some
 * source rule writes BOTH `-webkit-P` and `P`. That distinction matters. A
 * hard-coded list flagged `-webkit-text-size-adjust: 100%` in global.css's
 * reset, where writing the prefix alone is correct and deliberate — the
 * standard property is unsupported in Chrome and Safari. Deriving the set from
 * the source cannot make that mistake, and it picks up any new pair for free.
 *
 * Runs as `postbuild`, so a violation fails `npm run build` and CI never
 * reaches `wrangler pages deploy`. Reads only; writes nothing.
 *
 * To watch it fail: in any of those components, move the standard property
 * back above its `-webkit-` form and run `npm run build`.
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const SRC = process.env.SRC_DIR ?? 'src';
const DIST = process.env.DIST_DIR ?? 'dist';
const SEP = String.fromCharCode(92);
const posix = (p) => p.split(SEP).join('/');

/**
 * Files under `dir` with one of `exts`. Uses recursive readdirSync rather than
 * fs.globSync: glob is still experimental on Node 22, which is what CI runs,
 * and this gate blocks the deploy if it throws.
 */
const filesUnder = (dir, exts) => {
  let entries;
  try {
    entries = readdirSync(dir, { recursive: true, withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter((e) => e.isFile() && exts.some((x) => e.name.endsWith(x)))
    .map((e) => posix(path.relative(dir, path.join(e.parentPath ?? e.path, e.name))));
};

/** Declarations inside one rule body, comments stripped. */
const declsOf = (body) =>
  body.replace(/\/\*[\s\S]*?\*\//g, '').split(';').map((d) => d.trim()).filter(Boolean);

// ---- 1. What does the SOURCE intend to pair? -------------------------------
const intended = new Map(); // property -> [{file, selector}]
const srcFiles = filesUnder(SRC, ['.astro', '.css']);
for (const rel of srcFiles) {
  const file = posix(rel);
  let text = readFileSync(path.join(SRC, rel), 'utf8');
  if (file.endsWith('.astro')) {
    const styles = [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
    if (!styles.length) continue;
    text = styles.join('\n');
  }
  for (const m of text.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    const decls = declsOf(m[2]);
    for (const d of decls) {
      const p = /^-webkit-([a-z-]+)\s*:/.exec(d);
      if (!p) continue;
      const prop = p[1];
      if (!decls.some((x) => new RegExp(`^${prop}\\s*:`).test(x))) continue;
      if (!intended.has(prop)) intended.set(prop, []);
      intended.get(prop).push({ file, selector: m[1].trim().split('\n').pop().trim() });
    }
  }
}

if (intended.size === 0) {
  console.log('verify-css-prefixes: ok — no prefixed/standard pairs written in ' + SRC + '/, nothing to police.');
  process.exit(0);
}

// ---- 2. Did every such pair survive into the BUILT css? --------------------
const violations = [];
let pagesScanned = 0;
let pairsChecked = 0;

for (const rel of filesUnder(DIST, ['.html']).sort()) {
  const file = posix(rel);
  const html = readFileSync(path.join(DIST, rel), 'utf8');
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
  if (!css) continue;
  pagesScanned++;

  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const body = m[2];
    if (!body.includes('-webkit-')) continue;
    const selector = m[1].trim();
    const decls = declsOf(body);
    for (const prop of intended.keys()) {
      const prefixed = decls.find((d) => d.startsWith(`-webkit-${prop}:`));
      if (!prefixed) continue;
      pairsChecked++;
      // Anchor the standard form so `mask-image` cannot satisfy `mask`.
      const standard = decls.find((d) => new RegExp(`^${prop}\\s*:`).test(d));
      if (!standard) {
        violations.push({ file, selector, prop, prefixed, reason: 'standard property missing' });
        continue;
      }
      const pv = prefixed.slice(`-webkit-${prop}:`.length).trim();
      const sv = standard.slice(standard.indexOf(':') + 1).trim();
      if (pv !== sv) violations.push({ file, selector, prop, prefixed, reason: `values differ (${pv} vs ${sv})` });
    }
  }
}

if (pagesScanned === 0) {
  console.error('verify-css-prefixes: no built pages with inline CSS found in ' + DIST + '/.');
  console.error('  This check is meaningless without a build. Run `npm run build`.');
  process.exit(2);
}

const byRule = new Map();
for (const v of violations) {
  const key = v.selector + ' :: ' + v.prop + ' :: ' + v.reason;
  if (!byRule.has(key)) byRule.set(key, { ...v, pages: [] });
  byRule.get(key).pages.push(v.file);
}

if (byRule.size === 0) {
  console.log(
    `verify-css-prefixes: ok — paired in src/: ${[...intended.keys()].join(', ')}; ` +
    `${pairsChecked} built declaration(s) across ${pagesScanned} page(s) all kept their standard form.`,
  );
  process.exit(0);
}

console.error(`\nverify-css-prefixes: ${byRule.size} rule(s) lost the standard half of a pair the source writes.\n`);
for (const v of byRule.values()) {
  const where = (intended.get(v.prop) ?? []).map((s) => s.file).filter((f, i, a) => a.indexOf(f) === i);
  console.error(`  ${v.selector}`);
  console.error(`    ${v.prefixed}   <-- ${v.reason}`);
  console.error(`    on ${v.pages.length} page(s), e.g. ${v.pages[0]}`);
  console.error(`    source writes this pair in: ${where.join(', ')}`);
  console.error(`    Fix: write -webkit-${v.prop} FIRST and ${v.prop} LAST.\n`);
}
console.error('Lightning CSS keeps whichever of the pair was declared last and regenerates');
console.error('prefixes from vite.build.cssTarget. Standard last. See CLAUDE.md.\n');
process.exit(1);
