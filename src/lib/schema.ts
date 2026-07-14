/**
 * JSON-LD helpers. BaseLayout renders a single @graph per page: the stable
 * WebSite + Person pair (declared in BaseLayout.astro) plus whatever nodes a
 * page passes via its `schema` prop. Node ids are absolute URLs and must stay
 * stable so search engines merge every page's signals into one entity.
 */

type Origin = URL | string;

/** Absolute URL for a site path — JSON-LD requires absolute URLs. */
export const abs = (origin: Origin, path: string) => new URL(path, origin).href;

/** Stable node id of the site-wide Person entity (declared in BaseLayout). */
export const personId = (origin: Origin) => abs(origin, "/#person");

/** Reference to the Person node, for creator/author/mainEntity fields. */
export const personRef = (origin: Origin) => ({ "@id": personId(origin) });

/** BreadcrumbList from ordered {name, path} pairs (paths relative to root). */
export function breadcrumbs(
  origin: Origin,
  trail: { name: string; path: string }[],
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: abs(origin, crumb.path),
    })),
  };
}
