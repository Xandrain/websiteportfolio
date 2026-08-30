import { closeSync, openSync, readSync, readdirSync } from "node:fs";
import path from "node:path";
import { dims } from "./responsive";
import type { Production } from "../data/three-d";

/**
 * One gallery slot on a production page. Videos carry both encodings plus a
 * poster; the poster also supplies the intrinsic dimensions (it goes through
 * gen-responsive like any raster, so it lands in img-dims.json).
 */
export type GalleryItem =
  | { kind: "image"; src: string; w?: number; h?: number }
  | { kind: "animation"; src: string; poster: string; w?: number; h?: number; loopMs?: number }
  | { kind: "video"; webm?: string; mp4?: string; poster?: string; w?: number; h?: number };

const IMAGE_RE = /\.(jpe?g|png|webp|gif)$/i;
const VIDEO_RE = /\.(mp4|webm)$/i;
const VARIANT_RE = /-\d+\.webp$/i; // gen-responsive's generated variants
const POSTER_RE = /-poster$/i;

type Parts = { image?: string; webm?: string; mp4?: string; poster?: string };

/** Group a project folder's files by basename ("01.webm" + "01.mp4" +
 * "01-poster.jpg" all belong to "01"). Runs at build time only. */
function scan(slug: string): Map<string, Parts> {
  const dir = path.join(process.cwd(), "public", "productions", slug);
  let files: string[] = [];
  try {
    files = readdirSync(dir);
  } catch {
    return new Map();
  }

  const map = new Map<string, Parts>();
  const get = (base: string) => {
    let p = map.get(base);
    if (!p) map.set(base, (p = {}));
    return p;
  };

  for (const f of files.sort()) {
    if (VARIANT_RE.test(f)) continue;
    const ext = path.extname(f);
    const base = path.basename(f, ext);
    const pub = `/productions/${slug}/${f}`;
    if (VIDEO_RE.test(f)) {
      get(base)[ext.toLowerCase() === ".webm" ? "webm" : "mp4"] = pub;
    } else if (POSTER_RE.test(base)) {
      get(base.replace(POSTER_RE, ""))["poster"] = pub;
    } else if (IMAGE_RE.test(f)) {
      const p = get(base);
      if (!p.image) p.image = pub; // first ext wins if duplicated
    }
  }
  return map;
}

/**
 * How long one lap of an animated WebP lasts, in milliseconds — the sum of its
 * per-frame durations. `null` for a still image.
 *
 * The project page needs this to keep a set of turnarounds in phase. An
 * animated image exposes no playback API, so the only thing the page can
 * choose is the moment a loop *begins*, and animations can only be aligned
 * that way if they agree on how long a lap lasts (gen-anim.mjs
 * --cadence/--total-ms is what puts a set on one clock).
 *
 * Read here rather than through sharp so `gallery()` stays synchronous: a
 * WebP carries each frame's duration in the header of its ANMF chunk, so this
 * walks the container's chunk table and never touches a pixel.
 */
function loopMs(pub: string): number | undefined {
  let fd: number;
  try {
    fd = openSync(path.join(process.cwd(), "public", pub), "r");
  } catch {
    return undefined;
  }
  try {
    const head = Buffer.alloc(12);
    if (readSync(fd, head, 0, 12, 0) < 12) return undefined;
    if (head.toString("latin1", 0, 4) !== "RIFF") return undefined;
    if (head.toString("latin1", 8, 12) !== "WEBP") return undefined;

    const end = 8 + head.readUInt32LE(4);
    const header = Buffer.alloc(8);
    const frame = Buffer.alloc(16);
    let pos = 12;
    let total = 0;
    let frames = 0;
    while (pos + 8 <= end) {
      if (readSync(fd, header, 0, 8, pos) < 8) break;
      const size = header.readUInt32LE(4);
      if (header.toString("latin1", 0, 4) === "ANMF") {
        // ANMF payload: x/y/w/h, 3 bytes each, then the frame duration.
        if (readSync(fd, frame, 0, 16, pos + 8) < 16) break;
        total += frame.readUIntLE(12, 3);
        frames++;
      }
      pos += 8 + size + (size % 2); // chunk payloads are padded to even
    }
    return frames > 0 ? total : undefined;
  } finally {
    closeSync(fd);
  }
}

function toItem(parts: Parts): GalleryItem {
  if (parts.webm || parts.mp4) {
    const d = parts.poster ? dims(parts.poster) : undefined;
    return { kind: "video", webm: parts.webm, mp4: parts.mp4, poster: parts.poster, ...d };
  }
  // An image with a sibling poster is an animated WebP (scripts/gen-anim.mjs):
  // transparent turnarounds, whose per-frame timing video cannot carry. The
  // poster is its paused/reduced-motion still, and — since gen-responsive
  // deliberately makes no variants for an animated source — the fallback the
  // dimensions can be read from.
  if (parts.image && parts.poster) {
    const d = dims(parts.image) ?? dims(parts.poster);
    return {
      kind: "animation",
      src: parts.image,
      poster: parts.poster,
      loopMs: loopMs(parts.image),
      ...d,
    };
  }
  const d = parts.image ? dims(parts.image) : undefined;
  return { kind: "image", src: parts.image ?? "", ...d };
}

/**
 * Ordered gallery for a production page.
 *
 * Default (no `images` override): every numbered file in
 * `public/productions/<slug>/` (01.*, 02.*, …) sorted by name — so adding an
 * image or a converted video (see scripts/gen-video.mjs) is just dropping
 * files in the folder. `cover.*` is excluded unless the project sets
 * `coverInGallery`, which prepends it (the product-viz convention).
 *
 * With an `images` override, paths render in the given order; a `.mp4`/`.webm`
 * path pulls in its sibling encoding and poster automatically.
 */
export function gallery(project: Production): GalleryItem[] {
  const parts = scan(project.slug);

  if (project.images && project.images.length > 0) {
    return project.images.map((src) => {
      const base = path.basename(src, path.extname(src));
      if (VIDEO_RE.test(src)) return toItem(parts.get(base) ?? {});
      return { kind: "image", src, ...dims(src) };
    });
  }

  const items: GalleryItem[] = [];
  if (project.coverInGallery) {
    items.push({ kind: "image", src: project.cover, ...dims(project.cover) });
  }
  for (const [base, p] of [...parts.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    // cover.* is the listing-card image; reel.* is the showreel, rendered
    // above the gallery by reel(); yt-*.jpg are YouTube facade posters.
    if (/^(cover|reel|yt-)/i.test(base)) continue;
    const item = toItem(p);
    if (item.kind === "image" && !item.src) continue; // poster-only leftovers
    items.push(item);
  }
  return items;
}

/**
 * The project's showreel, if its folder has one: a `reel.webm` / `reel.mp4`
 * pair plus `reel-poster.jpg` (see scripts/gen-video.mjs --audio).
 *
 * Kept out of the numbered gallery deliberately. Gallery clips are short
 * silent loops that autoplay; a reel is an edited piece with sound, so the
 * page gives it one hero slot above the grid, behind a click-to-play facade
 * (components/productions/ProjectReel.astro).
 */
export function reel(project: Production): Extract<GalleryItem, { kind: "video" }> | null {
  const parts = scan(project.slug).get("reel");
  if (!parts || (!parts.webm && !parts.mp4)) return null;
  const item = toItem(parts);
  return item.kind === "video" ? item : null;
}
