/**
 * gen-cube-frames.mjs
 * ───────────────────
 * Generates a WebP sequence of a cube doing one full Y-axis revolution.
 * Output: public/sequences/cube-revolution/0001.webp … 0060.webp
 *
 * Usage:  node scripts/gen-cube-frames.mjs
 * Options (env vars):
 *   FRAMES=60   number of frames  (default 60)
 *   FPS=24      playback fps hint saved to console
 *   WIDTH=800   canvas width      (default 800)
 *   HEIGHT=450  canvas height     (default 450)
 *   QUALITY=88  WebP quality 0-100 (default 88)
 */

import { createCanvas } from "@napi-rs/canvas";
import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, "..");

const FRAMES  = parseInt(process.env.FRAMES  ?? "60");
const WIDTH   = parseInt(process.env.WIDTH   ?? "800");
const HEIGHT  = parseInt(process.env.HEIGHT  ?? "450");
const QUALITY = parseInt(process.env.QUALITY ?? "88");
const FPS     = parseInt(process.env.FPS     ?? "24");
const OUT_DIR = join(ROOT, "public", "sequences", "cube-revolution");

// ── Palette (matches the site's design tokens) ─────────────
const BG        = "#FAFAF8";           // --color-paper
const INK_DARK  = [26,  25,  23];      // --color-ink
const INK_LIGHT = [210, 205, 198];     // warm highlight

// Light direction (world space, fixed) — top-left-front
const LIGHT = normalise([0.45, 0.85, 0.55]);

// ── Math helpers ────────────────────────────────────────────
function normalise([x, y, z]) {
  const l = Math.sqrt(x*x + y*y + z*z);
  return [x/l, y/l, z/l];
}

function dot([ax, ay, az], [bx, by, bz]) {
  return ax*bx + ay*by + az*bz;
}

/** Rotate a 3-vector around Y */
function rotY([x, y, z], a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [x*c + z*s, y, -x*s + z*c];
}

/** Rotate a 3-vector around X */
function rotX([x, y, z], a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [x, y*c - z*s, y*s + z*c];
}

/** Simple perspective projection → canvas coords */
function project([x, y, z], fov, cx, cy, scale) {
  const depth = z + fov;
  const f     = (fov / Math.max(depth, 0.01)) * scale;
  return [cx + x * f, cy - y * f];
}

// ── Cube definition ──────────────────────────────────────────
// Unit cube, centered at origin; vertices indexed 0–7
const VERTS = [
  [-1, -1, -1], [ 1, -1, -1], [ 1,  1, -1], [-1,  1, -1], // back  0-3
  [-1, -1,  1], [ 1, -1,  1], [ 1,  1,  1], [-1,  1,  1], // front 4-7
];

// Each face: vertex indices (CCW when facing camera) + surface normal
const FACES = [
  { idx: [0,1,2,3], n: [ 0,  0, -1] }, // back
  { idx: [5,4,7,6], n: [ 0,  0,  1] }, // front
  { idx: [1,0,4,5], n: [ 0, -1,  0] }, // bottom
  { idx: [3,2,6,7], n: [ 0,  1,  0] }, // top
  { idx: [0,3,7,4], n: [-1,  0,  0] }, // left
  { idx: [2,1,5,6], n: [ 1,  0,  0] }, // right
];

// ── Colour from face brightness ──────────────────────────────
function faceColor(normal, angleY, angleX) {
  const rotated  = rotX(rotY(normal, angleY), angleX);
  const bright   = Math.max(0, dot(rotated, LIGHT));
  // Gamma-ish curve for more contrast
  const b = Math.pow(bright, 0.7);
  const r = Math.round(INK_DARK[0] + b * (INK_LIGHT[0] - INK_DARK[0]));
  const g = Math.round(INK_DARK[1] + b * (INK_LIGHT[1] - INK_DARK[1]));
  const b2= Math.round(INK_DARK[2] + b * (INK_LIGHT[2] - INK_DARK[2]));
  return `rgb(${r},${g},${b2})`;
}

// ── Draw one frame ───────────────────────────────────────────
function drawFrame(ctx, angleY, angleX) {
  const cx = WIDTH  / 2;
  const cy = HEIGHT / 2;
  const FOV   = 4.0;
  const SCALE = HEIGHT * 0.32; // cube fills ~64% of height

  // Background
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Transform all vertices
  const transformed = VERTS.map(v => rotX(rotY(v, angleY), angleX));

  // Compute face depths + sort back-to-front (painter's algorithm)
  const sorted = FACES.map(face => {
    const avgZ = face.idx.reduce((s, i) => s + transformed[i][2], 0) / face.idx.length;
    return { ...face, avgZ };
  }).sort((a, b) => a.avgZ - b.avgZ);

  // Draw each face
  for (const face of sorted) {
    const pts = face.idx.map(i => project(transformed[i], FOV, cx, cy, SCALE));

    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();

    ctx.fillStyle = faceColor(face.n, angleY, angleX);
    ctx.fill();
  }

  // Optional: very subtle drop shadow drawn as a darkened ellipse
  const shadowY = cy + SCALE * 0.68;
  const shadowRX = SCALE * 0.52;
  const shadowRY = SCALE * 0.07;
  const shadowGrad = ctx.createRadialGradient(cx, shadowY, 0, cx, shadowY, shadowRX);
  shadowGrad.addColorStop(0,   "rgba(26,25,23,0.12)");
  shadowGrad.addColorStop(1,   "rgba(26,25,23,0)");
  ctx.beginPath();
  ctx.ellipse(cx, shadowY, shadowRX, shadowRY, 0, 0, Math.PI * 2);
  ctx.fillStyle = shadowGrad;
  ctx.fill();
}

// ── Main ─────────────────────────────────────────────────────
await mkdir(OUT_DIR, { recursive: true });

const TILT_X = -0.28; // ~16° downward tilt to reveal the top face

console.log(`\nGenerating ${FRAMES} frames → ${OUT_DIR}\n`);

for (let f = 0; f < FRAMES; f++) {
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx    = canvas.getContext("2d");

  const angleY = (f / FRAMES) * Math.PI * 2; // full revolution
  drawFrame(ctx, angleY, TILT_X);

  const buffer   = await canvas.encode("webp", QUALITY);
  const filename = String(f + 1).padStart(4, "0") + ".webp";
  await writeFile(join(OUT_DIR, filename), buffer);

  // Progress bar
  const pct  = Math.round(((f + 1) / FRAMES) * 100);
  const bar  = "█".repeat(Math.floor(pct / 5)).padEnd(20, "░");
  process.stdout.write(`\r  [${bar}] ${pct}%  frame ${f+1}/${FRAMES}`);
}

console.log(`\n\nDone. ${FRAMES} frames at ${WIDTH}×${HEIGHT}, ${FPS} fps.`);
console.log(`Activate in src/data/three-d.ts:\n`);
console.log(`  sequence: {`);
console.log(`    basePath:   "/sequences/cube-revolution/",`);
console.log(`    frameCount: ${FRAMES},`);
console.log(`    fps:        ${FPS},`);
console.log(`  },\n`);
