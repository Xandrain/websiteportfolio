// Generate downscaled WebP variants for the self-hosted raster images and emit
// a manifest the components read to build responsive <img srcset>. Idempotent:
// existing variant files are left alone; the manifest is always rewritten to
// match what's on disk.
//
//   node scripts/gen-responsive.mjs
//
// Runs automatically before `npm run build` (see package.json "prebuild").
// Animated GIFs are skipped (can't be re-encoded without losing animation) and
// simply fall back to their original <img src> with no srcset.
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
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

const manifest = {};
let made = 0, skipped = 0;

for (const r of ROOTS) {
  const sources = await collect(path.join(PUB, r));
  for (const abs of sources) {
    const buf = await readFile(abs);
    const meta = await sharp(buf).metadata();
    const srcW = meta.width ?? 0;
    if (!srcW) continue;

    // widths smaller than the source, plus one at the native width
    const widths = [...new Set([...TARGET_WIDTHS.filter((w) => w < srcW), srcW])].sort((a, b) => a - b);

    const dir = path.dirname(abs);
    const base = path.basename(abs).replace(RASTER_RE, "");
    const entries = [];
    for (const w of widths) {
      const outAbs = path.join(dir, `${base}-${w}.webp`);
      if (!(await exists(outAbs))) {
        await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(outAbs);
        made++;
      } else {
        skipped++;
      }
      entries.push({ w, src: toPublicPath(outAbs) });
    }
    manifest[toPublicPath(abs)] = entries;
  }
}

const outFile = path.join(ROOT, "src/data/img-manifest.json");
await writeFile(outFile, JSON.stringify(manifest, null, 2) + "\n", "utf8");

console.log(`variants generated ${made}, reused ${skipped}, sources ${Object.keys(manifest).length}`);
console.log(`manifest → src/data/img-manifest.json`);
