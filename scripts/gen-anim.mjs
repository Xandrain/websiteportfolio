// Convert an animated source (GIF, APNG, animated WebP) into the pair of files
// the project pages expect for a *transparent* animation:
//
//   node scripts/gen-anim.mjs public/productions/<slug>/01.gif [more files…]
//
// For each input `<dir>/<name>.<ext>` this writes, next to it:
//   <name>.webp         animated WebP — lossless by default
//   <name>-poster.webp  first frame, static — what shows under
//                       prefers-reduced-motion and when the animation is
//                       paused, and what gives the layout its dimensions
//
// Why WebP and not the .webm/.mp4 pair from gen-video.mjs: video cannot carry
// either of the two things these 3D turnarounds depend on.
//   • Alpha. FFmpeg accepts -pix_fmt yuva420p for VP8/VP9 and then silently
//     drops the plane — the output decodes as yuv420p, so the transparent
//     background flattens to a hard white square on the page's warm paper.
//   • Per-frame timing. The turnarounds hold their last frame ~1500ms against
//     150ms for the spin; constant-frame-rate video turns that into a uniform
//     rotation and loses the beat the animation was cut on.
// WebP keeps both, is lossless here (smaller than the source GIF, since GIF
// wastes bytes on its 256-colour palette), and is supported everywhere the
// site targets — Safari 14+, Chrome, Firefox, Edge.
//
// Flags: --quality=N  lossy instead of lossless (1-100, ~90 is a good floor)
//        --effort=N   encoder search effort, 0-6, default 6 (slowest/smallest)
//
// The original file is left in place — delete it once you are happy.
import sharp from "sharp";
import path from "node:path";
import { existsSync, statSync } from "node:fs";

let quality = null; // null = lossless
let effort = 6;
const inputs = [];
for (const arg of process.argv.slice(2)) {
  const q = /^--quality=(\d{1,3})$/.exec(arg);
  const e = /^--effort=([0-6])$/.exec(arg);
  if (q) quality = Number(q[1]);
  else if (e) effort = Number(e[1]);
  else inputs.push(arg);
}

if (inputs.length === 0) {
  console.error("usage: node scripts/gen-anim.mjs [--quality=N] [--effort=N] <file.gif> [more files…]");
  process.exit(1);
}

const opts = quality === null ? { lossless: true, effort } : { quality, effort };
console.log(`animated webp: ${quality === null ? "lossless" : `quality ${quality}`}, effort ${effort}`);

const kb = (f) => `${Math.round(statSync(f).size / 1024)}KB`;

for (const input of inputs) {
  if (!existsSync(input)) {
    console.error(`skip (not found): ${input}`);
    continue;
  }
  const dir = path.dirname(input);
  const name = path.basename(input, path.extname(input));
  const anim = path.join(dir, `${name}.webp`);
  const poster = path.join(dir, `${name}-poster.webp`);

  // `animated: true` reads every page and carries the per-frame delay array
  // through to the encoder; without it sharp would take frame 1 and stop.
  await sharp(input, { animated: true }).webp({ ...opts, loop: 0 }).toFile(anim);
  await sharp(input).webp({ ...opts }).toFile(poster);

  const meta = await sharp(anim, { animated: true }).metadata();
  const delays = meta.delay ?? [];
  console.log(
    `→ ${name}.webp ${kb(anim)} (${meta.pages} frames, ${delays.join("/")}ms, ` +
      `alpha ${meta.hasAlpha ? "kept" : "MISSING"}) + ${name}-poster.webp ${kb(poster)}`,
  );
}
