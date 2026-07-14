// Convert an animated source (GIF, MOV, MP4 screen-capture…) into the pair of
// web-video files the project pages expect, plus a poster frame:
//
//   node scripts/gen-video.mjs public/productions/<slug>/01.gif [more files…]
//
// For each input `<dir>/<name>.<ext>` this writes, next to it:
//   <name>.webm        VP9  — smallest, served first
//   <name>.mp4         H.264 — universal fallback
//   <name>-poster.jpg  first frame — <video poster>, also gives the layout
//                      its intrinsic dimensions via gen-responsive's dims map
//
// The original file is left in place — delete it yourself once happy (GIFs
// especially: the whole point is to stop shipping them). Uses the ffmpeg
// binary bundled by the `ffmpeg-static` devDependency; nothing needs to be
// installed on the machine.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import ffmpeg from "ffmpeg-static";

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error("usage: node scripts/gen-video.mjs <file.gif> [more files…]");
  process.exit(1);
}

// Video encoders need even pixel dimensions; GIFs can be odd-sized.
const EVEN = "scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos";

function run(args) {
  execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", ...args], {
    stdio: "inherit",
  });
}

for (const input of inputs) {
  if (!existsSync(input)) {
    console.error(`skip (not found): ${input}`);
    continue;
  }
  const dir = path.dirname(input);
  const name = path.basename(input, path.extname(input));
  const out = (suffix) => path.join(dir, name + suffix);

  console.log(`→ ${input}`);
  run(["-i", input, "-vf", EVEN, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "42",
       "-row-mt", "1", "-pix_fmt", "yuv420p", "-an", out(".webm")]);
  run(["-i", input, "-vf", EVEN, "-c:v", "libx264", "-crf", "24", "-preset", "slow",
       "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", out(".mp4")]);
  run(["-i", input, "-vf", EVEN, "-frames:v", "1", "-q:v", "3", out("-poster.jpg")]);
  console.log(`  ✓ ${name}.webm / ${name}.mp4 / ${name}-poster.jpg`);
}
