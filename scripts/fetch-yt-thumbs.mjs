// Download YouTube thumbnails for an episode slideshow, self-hosted so the
// page makes no third-party request (img-src stays 'self'):
//
//   node scripts/fetch-yt-thumbs.mjs <slug> <youtube-id> [<youtube-id> ...]
//   → public/productions/<slug>/yt-<id>.jpg   (640×360)
//
// Then run `npm run images` for the WebP variants + dims. Same yt-<id> naming
// as fetch-yt-poster.mjs, so media.ts already keeps these out of the gallery.
// Takes maxresdefault (1280×720) and downsizes it: the slot is ~420px wide,
// so 640 covers it at 1.5x and keeps 52 files at a sane repo weight. Never
// hqdefault — that one is 4:3 with black bars baked in. Existing files are
// skipped, so re-running after adding IDs only fetches the new ones.
import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [slug, ...ids] = process.argv.slice(2);
if (!slug || ids.length === 0) {
  console.error("usage: node scripts/fetch-yt-thumbs.mjs <slug> <youtube-id> [<youtube-id> ...]");
  process.exit(1);
}

const dir = path.join(process.cwd(), "public", "productions", slug);
await mkdir(dir, { recursive: true });

let failed = 0;
for (const id of ids) {
  const out = path.join(dir, `yt-${id}.jpg`);
  try {
    await access(out);
    console.log(`skip ${id} (exists)`);
    continue;
  } catch {}

  const res = await fetch(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`);
  const buf = res.ok ? Buffer.from(await res.arrayBuffer()) : null;
  // YouTube answers a missing maxres with a ~1 kB 120px placeholder.
  if (!buf || buf.length < 5_000) {
    console.error(`no maxres thumbnail for ${id}`);
    failed++;
    continue;
  }
  await sharp(buf)
    .resize(640, 360, { fit: "cover" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  console.log(`saved ${out}`);
}

if (failed) process.exit(1);
console.log("now run: npm run images");
