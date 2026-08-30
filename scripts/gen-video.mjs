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
// Flags
// -----
//   --webm-crf=N  --mp4-crf=N
//       Quality. Defaults are the web trade-off (VP9 42 / H.264 24); lower =
//       better = bigger, 0 is lossless. Flat-shaded 3D turntables band badly
//       at the defaults — the mojo-swoptops set uses 18/16.
//
//   --out-dir=DIR
//       Write the outputs to DIR instead of next to the input. Required when
//       the source is itself an .mp4: the mp4 output would otherwise resolve
//       to the input path and ffmpeg would truncate the file it is reading.
//       (There is a hard guard for that below — it refuses rather than
//       destroying a source.) Staging an mp4 in a scratch folder and pointing
//       --out-dir at the project folder also skips the rename step:
//         node scripts/gen-video.mjs --audio --out-dir=public/productions/x \
//           /tmp/stage/reel.mp4
//
//   --audio
//       Keep the source's audio track (Opus in the webm, AAC in the mp4).
//       Off by default: the numbered gallery clips are silent loops that
//       autoplay, and a soundtrack there would be both useless and a
//       nuisance. Turn it on for a `reel.*` — a real edited piece behind a
//       click-to-play facade, where the sound is part of the work.
//
//   --alpha [--matte=RRGGBB]
//       Keep the source's transparency. The webm becomes VP9 + alpha
//       (yuva420p), which Chrome/Edge/Firefox honour, and the poster becomes
//       `<name>-poster.webp` (JPEG cannot carry alpha) instead of a .jpg.
//       H.264 has no alpha channel anywhere it matters, so the mp4 — what
//       Safari and iOS get — is composited onto `--matte`, which must be the
//       colour actually behind the video on the page (the project pages use
//       --color-paper-alt, #F2F0EA, which is the default here). Switching a
//       clip to --alpha leaves its old -poster.jpg behind: delete it, or the
//       folder scan will pick the stale one.
//
// The original file is left in place — delete it yourself once happy (GIFs
// especially: the whole point is to stop shipping them). Uses the ffmpeg
// binary bundled by the `ffmpeg-static` devDependency; nothing needs to be
// installed on the machine.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import ffmpeg from "ffmpeg-static";

const DEFAULTS = { webm: "42", mp4: "24" };
const crf = { ...DEFAULTS };
let alpha = false;
let audio = false;
let matte = "F2F0EA"; // --color-paper-alt: what sits behind .project-video
let outDir = null;
const inputs = [];

for (const arg of process.argv.slice(2)) {
  const crfFlag = /^--(webm|mp4)-crf=(\d+)$/.exec(arg);
  const matteFlag = /^--matte=#?([0-9a-f]{6})$/i.exec(arg);
  const outFlag = /^--out-dir=(.+)$/.exec(arg);
  if (crfFlag) crf[crfFlag[1]] = crfFlag[2];
  else if (arg === "--alpha") alpha = true;
  else if (arg === "--audio") audio = true;
  else if (matteFlag) matte = matteFlag[1];
  else if (outFlag) outDir = outFlag[1];
  else inputs.push(arg);
}

if (inputs.length === 0) {
  console.error(
    "usage: node scripts/gen-video.mjs [--webm-crf=N] [--mp4-crf=N] [--audio]\n" +
      "         [--alpha] [--matte=RRGGBB] [--out-dir=DIR] <file.gif> [more files…]",
  );
  process.exit(1);
}
console.log(
  `quality: vp9 crf ${crf.webm} / h.264 crf ${crf.mp4}` +
    (audio ? " · audio kept (opus/aac 128k)" : " · silent") +
    (alpha ? ` · alpha kept (mp4 matted on #${matte})` : ""),
);

// Audio is opt-in; without --audio every output is stripped with -an.
const WEBM_AUDIO = audio ? ["-c:a", "libopus", "-b:a", "128k"] : ["-an"];
const MP4_AUDIO = audio ? ["-c:a", "aac", "-b:a", "128k", "-ac", "2"] : ["-an"];

// Video encoders need even pixel dimensions; GIFs can be odd-sized.
const EVEN = "scale=trunc(iw/2)*2:trunc(ih/2)*2:flags=lanczos";
// Lay the clip over a solid card the size of the source: scale2ref sizes the
// colour generator from the input, so nothing needs to know the dimensions.
const MATTE = `color=c=0x${matte}:s=2x2[c];[c][0:v]scale2ref[bg][fg];[bg][fg]overlay=shortest=1,${EVEN},format=yuv420p`;

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
  const dir = outDir ?? path.dirname(input);
  const name = path.basename(input, path.extname(input));
  const out = (suffix) => path.join(dir, name + suffix);

  // An .mp4 source in the output directory would have ffmpeg read and write
  // the same path — it truncates the input a few seconds in and the source is
  // gone. Refuse instead, and say how to get unstuck.
  const clash = [".webm", ".mp4"]
    .map(out)
    .find((p) => path.resolve(p) === path.resolve(input));
  if (clash) {
    console.error(
      `refusing: "${input}" is also an output path — ffmpeg would overwrite the source.\n` +
        `  pass --out-dir=<other dir>, or rename the input to a different basename.`,
    );
    process.exitCode = 1;
    continue;
  }

  mkdirSync(dir, { recursive: true });
  console.log(`→ ${input}`);

  // VP9. With --alpha, yuva420p carries the alpha plane; alt-ref frames are
  // incompatible with it, hence -auto-alt-ref 0.
  run(["-i", input, "-vf", EVEN, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", crf.webm,
       "-row-mt", "1", "-pix_fmt", alpha ? "yuva420p" : "yuv420p",
       ...(alpha ? ["-auto-alt-ref", "0"] : []), ...WEBM_AUDIO, out(".webm")]);

  // H.264: no alpha channel, so composite onto the matte instead of letting
  // the transparent pixels flatten to whatever the decoder happens to use.
  run([...(alpha ? ["-i", input, "-filter_complex", MATTE] : ["-i", input, "-vf", EVEN]),
       "-c:v", "libx264", "-crf", crf.mp4, "-preset", "slow",
       ...(alpha ? [] : ["-pix_fmt", "yuv420p"]),
       "-movflags", "+faststart", ...MP4_AUDIO, out(".mp4")]);

  // Poster: WebP when transparency has to survive, JPEG otherwise.
  const poster = alpha ? "-poster.webp" : "-poster.jpg";
  run(alpha
    ? ["-i", input, "-vf", EVEN, "-frames:v", "1", "-c:v", "libwebp",
       "-pix_fmt", "yuva420p", "-q:v", "90", "-compression_level", "6", out(poster)]
    : ["-i", input, "-vf", EVEN, "-frames:v", "1", "-q:v", "3", out(poster)]);

  console.log(`  ✓ ${name}.webm / ${name}.mp4 / ${name}${poster}`);
}
