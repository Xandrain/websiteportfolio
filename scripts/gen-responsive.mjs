// Generate downscaled WebP variants for the self-hosted raster images and emit
// a manifest the components read to build responsive <img srcset>. Idempotent:
// variants are reused while their source is unchanged, regenerated when the
// source's bytes change, and leftovers from a replaced source (e.g. a
// different native width) are deleted. Change detection is by content hash
// (src/data/img-hashes.json, committed) — not mtime, because Windows Explorer
// preserves the original file's mtime on copy, so a freshly swapped-in photo
// can look "older" than its stale variants.
//
//   node scripts/gen-responsive.mjs
//
// Runs automatically before `npm run build` (see package.json "prebuild").
// Animated GIFs are skipped (can't be re-encoded without losing animation) and
// simply fall back to their original <img src> with no srcset.
import { readdir, readFile, writeFile, stat, unlink } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const PUB = path.join(ROOT, "public");
const ROOTS = ["photography", "productions"]; // scanned recursively
const TARGET_WIDTHS = [400, 800, 1200, 1600];
const VARIANT_RE = /-\d+\.webp$/; // our own generated files
const RASTER_RE = /\.(jpe?g|webp|png)$/i;

/** Recursively collect source raster files (excluding our variants + gifs). */
async function collect(dir) {
  const out = [];
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { out.push(...(await collect(full))); continue; }
    if (!RASTER_RE.test(e.name)) continue;   // skip .gif and non-images
    if (VARIANT_RE.test(e.name)) continue;   // skip already-generated variants
    out.push(full);
  }
  return out;
}

function toPublicPath(abs) {
  return "/" + path.relative(PUB, abs).split(path.sep).join("/");
}

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const HASH_FILE = path.join(ROOT, "src/data/img-hashes.json");
let prevHashes = {};
try { prevHashes = JSON.parse(await readFile(HASH_FILE, "utf8")); } catch {}

const manifest = {};
const dims = {};
const hashes = {};
let made = 0, skipped = 0, removed = 0;

for (const r of ROOTS) {
  const sources = await collect(path.join(PUB, r));
  for (const abs of sources) {
    const buf = await readFile(abs);
    const meta = await sharp(buf).metadata();
    const srcW = meta.width ?? 0;
    if (!srcW) continue;
    const pub = toPublicPath(abs);
    dims[pub] = { w: srcW, h: meta.height ?? 0 };

    const hash = createHash("sha1").update(buf).digest("hex");
    const changed = prevHashes[pub] !== hash; // no previous hash counts as changed
    hashes[pub] = hash;

    // widths smaller than the source, plus one at the native width
    const widths = [...new Set([...TARGET_WIDTHS.filter((w) => w < srcW), srcW])].sort((a, b) => a - b);

    const dir = path.dirname(abs);
    const base = path.basename(abs).replace(RASTER_RE, "");
    const entries = [];
    for (const w of widths) {
      const outAbs = path.join(dir, `${base}-${w}.webp`);
      if (changed || !(await exists(outAbs))) {
        await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(outAbs);
        made++;
      } else {
        skipped++;
      }
      entries.push({ w, src: toPublicPath(outAbs) });
    }
    manifest[pub] = entries;

    // drop variants left over from an older version of this source
    // (e.g. the replacement image has a different native width)
    const variantRe = new RegExp(`^${escapeRe(base)}-(\\d+)\\.webp$`);
    for (const name of await readdir(dir)) {
      const m = name.match(variantRe);
      if (m && !widths.includes(Number(m[1]))) {
        await unlink(path.join(dir, name));
        removed++;
      }
    }
  }
}

const outFile = path.join(ROOT, "src/data/img-manifest.json");
await writeFile(outFile, JSON.stringify(manifest, null, 2) + "\n", "utf8");

const dimsFile = path.join(ROOT, "src/data/img-dims.json");
await writeFile(dimsFile, JSON.stringify(dims, null, 2) + "\n", "utf8");

await writeFile(HASH_FILE, JSON.stringify(hashes, null, 2) + "\n", "utf8");

console.log(`variants generated ${made}, reused ${skipped}, stale removed ${removed}, sources ${Object.keys(manifest).length}`);
console.log(`manifest → src/data/img-manifest.json`);
console.log(`dimensions → src/data/img-dims.json`);
