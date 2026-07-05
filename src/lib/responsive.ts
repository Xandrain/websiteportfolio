import manifest from "../data/img-manifest.json";

type Variant = { w: number; src: string };
const map = manifest as Record<string, Variant[]>;

/**
 * Build a responsive `srcset` for a self-hosted image path (e.g.
 * "/photography/nl1.jpg"). Returns `undefined` when no WebP variants exist for
 * the source — animated GIFs, unknown paths — so callers can pass it straight
 * to an `<img>` and Astro will simply omit the attribute, leaving the plain
 * `src` as the fallback. The original file stays the `src`; the browser only
 * ever downloads a smaller WebP when the layout slot allows it.
 *
 * Variants are produced by `scripts/gen-responsive.mjs` (runs on prebuild).
 */
export function srcset(src: string): string | undefined {
  const v = map[src];
  if (!v || v.length === 0) return undefined;
  return v.map((e) => `${e.src} ${e.w}w`).join(", ");
}
