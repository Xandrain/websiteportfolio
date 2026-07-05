/**
 * Site-wide content. Edit here to rebrand — no component changes needed.
 */
export const SITE = {
  name: "Alexandre Haineaux",
  role: "Graphic Designer & Photographer",
  tagline: "Light, form, and the space between.",
  description:
    "The portfolio of Alexandre Haineaux — photography, graphic design and 3D. A practice in light, restraint, and considered form.",
  email: "studio@alexandrehaineaux.com",
  location: "Luxembourg · Worldwide",
};

export const NAV: { href: string; label: string }[] = [
  { href: "/photography", label: "Photography" },
  { href: "/productions", label: "Graphic Design & 3D" },
  { href: "/about", label: "About" },
];

export const SOCIAL: { href: string; label: string }[] = [
  { href: "https://www.instagram.com/haineaux_alexandre", label: "Instagram" },
  { href: "https://xandrain.artstation.com", label: "ArtStation" },
  { href: `mailto:studio@alexandrehaineaux.com`, label: "Email" },
];
