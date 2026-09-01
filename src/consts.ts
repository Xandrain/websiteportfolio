/**
 * Site-wide content. Edit here to rebrand — no component changes needed.
 */
export const SITE = {
  name: "Alexandre Haineaux",
  role: "Graphic Designer & Photographer",
  tagline: "Light, form, and the space between.",
  description:
    "The portfolio of Alexandre Haineaux — photographer & graphic designer in Luxembourg. Photography, graphic design, and 3D; light, restraint, and considered form.",
  email: "contact@haineaux.com",
  location: "Luxembourg · Worldwide",
};

export const NAV: { href: string; label: string; short?: string }[] = [
  { href: "/productions", label: "Graphic Design & 3D", short: "Design & 3D" },
  { href: "/photography", label: "Photography" },
  { href: "/about", label: "About" },
];

/** Footer-only link to the legal notice page (not part of the main NAV). */
export const LEGAL = { href: "/legal", label: "Legal Notice" };

export const SOCIAL: { href: string; label: string }[] = [
  { href: "https://www.instagram.com/haineaux_alexandre", label: "Instagram" },
  { href: "https://xandrain.artstation.com", label: "ArtStation" },
  { href: `mailto:${SITE.email}`, label: "Email" },
];
