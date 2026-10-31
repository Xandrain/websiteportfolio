/**
 * Lets a "A · B · C" list wrap only after a separator, never inside an item.
 *
 * SITE.role is three titles joined by " · ". Left to the browser, a narrow
 * card broke it anywhere — "3D ARTIST" split from its "·", or a line opening
 * on the dot. Every space becomes a no-break space except the one after each
 * "·", so the dot stays at the end of the line it closes and each title
 * stays whole. Plain text out: screen readers hear the same words.
 */
export const wrapAtSeparators = (list: string) =>
  list.replaceAll(" ", " ").replaceAll("· ", "· ");
