import { readdirSync } from "node:fs";
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
  | { kind: "animation"; src: string; poster: string; w?: number; h?: number }
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
    return { kind: "animation", src: parts.image, poster: parts.poster, ...d };
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
    // cover.* is the listing-card image; yt-*.jpg are YouTube facade posters.
    if (/^(cover|yt-)/i.test(base)) continue;
    const item = toItem(p);
    if (item.kind === "image" && !item.src) continue; // poster-only leftovers
    items.push(item);
  }
  return items;
}
