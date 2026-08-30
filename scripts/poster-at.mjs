// Re-shoot a video's poster frame from a chosen timestamp:
//
//   node scripts/poster-at.mjs public/productions/<slug>/reel.mp4 5
//   node scripts/poster-at.mjs public/productions/<slug>/reel.mp4 00:00:05.5
//
// gen-video.mjs takes the poster from frame 1, which is right for a loop that
// starts on its subject but wrong for an edited piece — those usually open on
// black or a title card. This overwrites `<name>-poster.jpg` next to the
// input, so the layout's dimensions (via gen-responsive's dims map) and every
// reference to the file stay exactly as they were.
//
// Run `npm run images` afterwards to regenerate the poster's WebP variants.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import ffmpeg from "ffmpeg-static";

const [input, at = "0"] = process.argv.slice(2);

if (!input) {
  console.error("usage: node scripts/poster-at.mjs <video> [seconds|hh:mm:ss.ms]");
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`not found: ${input}`);
  process.exit(1);
}

const dir = path.dirname(input);
const name = path.basename(input, path.extname(input));
const out = path.join(dir, `${name}-poster.jpg`);

// -ss before -i seeks on keyframes (fast); the frame lands at or just after
// the requested time, which is what you want for "grab me a nice moment".
execFileSync(
  ffmpeg,
  ["-y", "-hide_banner", "-loglevel", "error", "-ss", String(at), "-i", input,
   "-frames:v", "1", "-q:v", "3", out],
  { stdio: "inherit" },
);

console.log(`✓ ${out}  (from ${at})`);
