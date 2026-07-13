// Generate the site's raster brand assets from the design tokens + self-hosted
// fonts, so social shares and home-screen icons work out of the box:
//
//   public/og.jpg            1200×630  — default Open Graph / Twitter card
//   public/apple-touch-icon.png 180×180 — iOS home-screen icon
//
// These are tasteful DEFAULTS — swap the files for bespoke artwork any time.
//   node scripts/gen-brand-assets.mjs
import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const FONTS = path.join(ROOT, "public", "fonts");
GlobalFonts.registerFromPath(path.join(FONTS, "bodoni-moda-400-latin.woff2"), "Bodoni Moda");
GlobalFonts.registerFromPath(path.join(FONTS, "jost-500-latin.woff2"), "Jost");

const PAPER = "#FAFAF8";
const INK = "#1A1917";
const INK_MUTED = "#736E68";
const ACCENT = "#16A36A";

function tracked(ctx, text, x, y, spacing) {
  const widths = [...text].map((ch) => ctx.measureText(ch).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1);
  let cx = x - total / 2;
  ctx.textAlign = "left";
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], cx, y);
    cx += widths[i] + spacing;
  }
  ctx.textAlign = "center";
}

async function makeOG() {
  const W = 1200, H = 630;
  const c = createCanvas(W, H);
  const ctx = c.getContext("2d");

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);

  // Hairline inner frame
  ctx.strokeStyle = "rgba(26,25,23,0.10)";
  ctx.lineWidth = 1;
  ctx.strokeRect(40.5, 40.5, W - 81, H - 81);

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";

  // Role eyebrow
  ctx.fillStyle = INK_MUTED;
  ctx.font = '500 22px Jost';
  tracked(ctx, "GRAPHIC DESIGNER & PHOTOGRAPHER", W / 2, 250, 5);

  // Wordmark
  ctx.fillStyle = INK;
  ctx.font = '400 92px "Bodoni Moda"';
  ctx.fillText("Alexandre Haineaux", W / 2, 355);

  // Emerald full-stop dot after the tagline
  ctx.fillStyle = INK_MUTED;
  ctx.font = '400 27px Jost';
  const tag = "Light, form, and the space between";
  ctx.fillText(tag, W / 2, 430);
  const tagW = ctx.measureText(tag).width;
  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.arc(W / 2 + tagW / 2 + 9, 424, 5, 0, Math.PI * 2);
  ctx.fill();

  await writeFile(path.join(ROOT, "public", "og.jpg"), await c.encode("jpeg", 92));
}

async function makeIcon() {
  const S = 180;
  const c = createCanvas(S, S);
  const ctx = c.getContext("2d");

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, S, S);

  ctx.fillStyle = PAPER;
  ctx.font = '400 96px "Bodoni Moda"';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("AH", S / 2, S / 2 - 4);

  // Emerald accent dot
  ctx.fillStyle = ACCENT;
  ctx.beginPath();
  ctx.arc(S / 2, S - 34, 5, 0, Math.PI * 2);
  ctx.fill();

  await writeFile(path.join(ROOT, "public", "apple-touch-icon.png"), await c.encode("png"));
}

await makeOG();
await makeIcon();
console.log("brand assets → public/og.jpg, public/apple-touch-icon.png");
