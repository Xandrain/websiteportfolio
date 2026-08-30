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
//        --cadence=N   force every frame but the last to N ms
//        --total-ms=N  make one loop exactly N ms, by giving the last frame
//                      whatever time is left over
//            Use the two together to bring a set of turnarounds onto one
//            clock: `--cadence=150 --total-ms=3300`. Do this for every
//            animation in a project meant to spin together. Browsers give
//            animated images no playback API — you cannot seek or align one
//            from script — but the project page can choose the moment each
//            loop *starts*, and it starts them on a shared beat (see
//            productions/[slug].astro). A beat can only hold animations
//            that agree on how long a lap lasts: one odd loop length slips
//            a little further out of step every lap, and nothing on the
//            page can correct it. Idempotent: a file already on the clock
//            comes out byte-identical.
//
//        --single-hold
//            Leave the animation holding on its LAST frame only. Any earlier
//            frame that runs longer than the spin's cadence is reset to it.
//            Some masters come out of the 3D app with a second hold a frame
//            or two before the end — the turnaround then visibly stalls,
//            stutters, and stalls again, out of step with the rest of the set.
//            The cadence is the most common delay in the file, so this is a
//            no-op on an animation that already holds exactly once.
//
// Re-running this on its own output is safe: each file is written to a
// temporary name and renamed into place, so an input that is also the output
// (`gen-anim.mjs --single-hold public/productions/x/04.webp`) is never read
// and written at the same time.
//
// The original file is left in place — delete it once you are happy.
import sharp from "sharp";
import path from "node:path";
import { existsSync, statSync, renameSync, readFileSync } from "node:fs";

let quality = null; // null = lossless
let effort = 6;
let singleHold = false;
let cadence = null;
let totalMs = null;
const inputs = [];
for (const arg of process.argv.slice(2)) {
  const q = /^--quality=(\d{1,3})$/.exec(arg);
  const e = /^--effort=([0-6])$/.exec(arg);
  const c = /^--cadence=(\d+)$/.exec(arg);
  const t = /^--total-ms=(\d+)$/.exec(arg);
  if (q) quality = Number(q[1]);
  else if (e) effort = Number(e[1]);
  else if (c) cadence = Number(c[1]);
  else if (t) totalMs = Number(t[1]);
  else if (arg === "--single-hold") singleHold = true;
  else inputs.push(arg);
}

if (inputs.length === 0) {
  console.error(
    "usage: node scripts/gen-anim.mjs [--quality=N] [--effort=N] [--single-hold]\n" +
      "         [--cadence=N] [--total-ms=N] <file.gif> [more files…]",
  );
  process.exit(1);
}

/**
 * Clamp every frame but the last to the animation's cadence, so the only
 * pause left is the closing one. The cadence is the modal delay — the spin is
 * always the overwhelming majority of frames — and ties break to the shorter
 * value, which is the safe direction here.
 */
/**
 * Put the animation on a fixed clock: every frame but the last runs at
 * `cadence`, and the last absorbs the remainder so one lap lasts exactly
 * `totalMs`. Either half works alone.
 */
function toClock(delays, cadence, totalMs, label) {
  if (delays.length < 2) return delays;
  let out = cadence === null ? [...delays] : delays.map((d, i) => (i === delays.length - 1 ? d : cadence));
  if (totalMs !== null) {
    const spin = out.slice(0, -1).reduce((a, b) => a + b, 0);
    const hold = totalMs - spin;
    if (hold <= 0) {
      throw new Error(
        `${label}: --total-ms=${totalMs} leaves no time for the final frame ` +
          `(${out.length - 1} frames already run ${spin}ms)`,
      );
    }
    out = [...out.slice(0, -1), hold];
  }
  return out;
}

function toSingleHold(delays) {
  if (delays.length < 2) return delays;
  const counts = new Map();
  for (const d of delays) counts.set(d, (counts.get(d) ?? 0) + 1);
  const cadence = [...counts].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0][0];
  return delays.map((d, i) => (i === delays.length - 1 ? d : Math.min(d, cadence)));
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
  // Read to a buffer rather than letting sharp open the path: on Windows an
  // open read handle makes the rename below fail with EPERM, and the input is
  // frequently the file being replaced.
  const buf = readFileSync(input);
  const src = await sharp(buf, { animated: true }).metadata();
  let delay = singleHold ? toSingleHold(src.delay ?? []) : undefined;
  if (cadence !== null || totalMs !== null) {
    delay = toClock(delay ?? src.delay ?? [], cadence, totalMs, name);
  }
  if (delay && JSON.stringify(delay) !== JSON.stringify(src.delay)) {
    console.log(`  holds normalised: ${(src.delay ?? []).join("/")} → ${delay.join("/")}ms`);
  }

  // Write beside the target, then rename over it: the input is often the
  // output (re-running --single-hold on a shipped .webp), and sharp must not
  // be reading a file it is also writing.
  const tmp = (f) => `${f}.tmp.webp`;
  await sharp(buf, { animated: true })
    .webp({ ...opts, loop: 0, ...(delay ? { delay } : {}) })
    .toFile(tmp(anim));
  await sharp(buf).webp({ ...opts }).toFile(tmp(poster));
  renameSync(tmp(anim), anim);
  renameSync(tmp(poster), poster);

  const meta = await sharp(anim, { animated: true }).metadata();
  const delays = meta.delay ?? [];
  console.log(
    `→ ${name}.webp ${kb(anim)} (${meta.pages} frames, ${delays.join("/")}ms, ` +
      `alpha ${meta.hasAlpha ? "kept" : "MISSING"}) + ${name}-poster.webp ${kb(poster)}`,
  );
}
