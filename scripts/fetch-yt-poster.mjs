// Download a YouTube video's thumbnail to the self-hosted poster path the
// YouTubeEmbed facade expects, so the page needs no third-party request
// until the visitor actually presses play (and img-src stays 'self'):
//
//   node scripts/fetch-yt-poster.mjs <slug> <youtube-id>
//   → public/productions/<slug>/yt-<id>.jpg
//
// Then run `npm run images` so the poster gets responsive variants + dims.
// Tries maxresdefault first, falls back to hqdefault (not every video has
// the high-res thumbnail).
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const [slug, id] = process.argv.slice(2);
if (!slug || !id) {
  console.error("usage: node scripts/fetch-yt-poster.mjs <slug> <youtube-id>");
  process.exit(1);
}

const candidates = [
  `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
  `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
];

let bytes = null;
for (const url of candidates) {
  const res = await fetch(url);
  // YouTube serves a 120px placeholder (~1kB) for missing maxres — skip those.
  if (res.ok) {
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 5_000) {
      bytes = buf;
      console.log(`fetched ${url} (${Math.round(buf.length / 1024)} kB)`);
      break;
    }
  }
}
if (!bytes) {
  console.error(`no usable thumbnail found for video id "${id}"`);
  process.exit(1);
}

const dir = path.join(process.cwd(), "public", "productions", slug);
await mkdir(dir, { recursive: true });
const out = path.join(dir, `yt-${id}.jpg`);
await writeFile(out, bytes);
console.log(`saved ${out} — now run: npm run images`);
