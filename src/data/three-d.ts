export type ProductionCategory = "productions" | "product-visualisation";

export interface Production {
  slug: string;
  title: string;
  description: string;
  cover: string;
  year: number;
  tags: string[];
  /** Which sub-section of Graphic Design & 3D this belongs to. */
  category: ProductionCategory;
  /**
   * Optional explicit gallery order (paths under /public). Normally OMIT this:
   * the project page derives its gallery automatically from the numbered files
   * (01.*, 02.*, …) in public/productions/<slug>/ — images and videos alike
   * (see src/lib/media.ts). Only set it to force a non-alphabetical order.
   */
  images?: string[];
  /** Show the cover as the first gallery item (the product-viz convention). */
  coverInGallery?: boolean;
  /**
   * YouTube videos (turnarounds, breakdowns) shown after the gallery. Each
   * needs a self-hosted poster at public/productions/<slug>/yt-<id>.jpg —
   * run `node scripts/fetch-yt-poster.mjs <slug> <id>` to download it.
   * Example: youtube: [{ id: "dQw4w9WgXcQ", title: "360° turnaround" }],
   */
  youtube?: { id: string; title: string }[];
}

export const projects: Production[] = [
  {
    slug: "mojo-swoptops",
    title: "Mojo SwopTops — 3D Modeller",
    description:
      "3D modeling for Mojo SwopTops, a children's animated series broadcast on the BBC — props, vehicles, and characters built over more than a year of production.",
    cover: "/productions/mojo-swoptops/cover.jpg",
    year: 2024,
    category: "productions",
    tags: ["3D Modeling", "TV / Animation"],
  },
  {
    slug: "azureus",
    title: "AZUREUS: The Animated Series",
    description:
      "Rigging and texturing on AZUREUS, an animated series produced by BlackSun Entertainment under the supervision of Mason Doran.",
    cover: "/productions/azureus/cover.jpg",
    year: 2024,
    category: "productions",
    tags: ["Rigging", "TV / Animation"],
  },
  {
    slug: "crown-reinterpretation",
    title: "Crown Reinterpretation",
    description:
      "A 3D reinterpretation of \"Crown\", a watercolour and Indian ink painting by Olivier Menanteau — deformation-ready topology throughout, with scattered instancing for the grass, rock, and mushroom detail.",
    cover: "/productions/crown-reinterpretation/cover.jpg",
    year: 2025,
    category: "productions",
    tags: ["Character Art", "Personal Work"],
  },
  {
    slug: "rambochador",
    title: "‘Rambochador’ Training",
    description:
      "Personal study translating a 2D character design by Kim Jacinto into 3D — working through pose, weight, and how a figure that size handles a gun that large.",
    cover: "/productions/rambochador/cover.jpg",
    year: 2023,
    category: "productions",
    tags: ["Character Art", "Stylized"],
  },
  {
    slug: "chance-parfume",
    title: "Chance Parfume",
    description:
      "Product visualisation study of Chanel's Chance Eau Vive, made for training purposes.",
    cover: "/productions/chance-parfume/cover.jpg",
    year: 2023,
    category: "product-visualisation",
    tags: ["Product Visualization"],
  },

  // ── Product Visualisation — product renders (bottles, labels, packaging) ──
  {
    slug: "vermouth-rosso",
    title: "Vermouth Rosso — Emi Renzi",
    description:
      "Product visualisation of Emi Renzi's \"El néctar de Los Guardas\" vermouth — bottle, label, and studio-lit environment renders.",
    cover: "/productions/vermouth-rosso/cover.webp",
    year: 2025,
    category: "product-visualisation",
    tags: ["Product Visualization", "3D Render"],
    coverInGallery: true,
  },
  {
    slug: "half-moon-eau-de-parfum",
    title: "Half Moon — Eau de Parfum",
    description:
      "A perfume-bottle visualisation for \"Half Moon\" eau de parfum — studio render with a wireframe breakdown.",
    cover: "/productions/half-moon-eau-de-parfum/cover.webp",
    year: 2026,
    category: "product-visualisation",
    tags: ["Product Visualization", "Packaging"],
    coverInGallery: true,
  },
  {
    slug: "avocado-lms-bio",
    title: "Avocado LMS Bio",
    description:
      "Product render of the Avocado LMS Bio bottle — a clean studio setup with a wireframe pass.",
    cover: "/productions/avocado-lms-bio/cover.webp",
    year: 2026,
    category: "product-visualisation",
    tags: ["Product Visualization", "3D Render"],
    coverInGallery: true,
  },
  {
    slug: "emperor-orange-lime",
    title: "Emperor — Orange-Lime",
    description:
      "Beverage-bottle visualisation for \"Emperor\" Orange-Lime — beauty and wireframe renders.",
    cover: "/productions/emperor-orange-lime/cover.webp",
    year: 2026,
    category: "product-visualisation",
    tags: ["Product Visualization", "3D Render"],
    coverInGallery: true,
  },
  {
    slug: "lulu-acidoactive",
    title: "Lulu — AcidoActive",
    description:
      "Cosmetic-bottle visualisation for \"Lulu AcidoActive\" — studio lighting with a wireframe breakdown.",
    cover: "/productions/lulu-acidoactive/cover.webp",
    year: 2026,
    category: "product-visualisation",
    tags: ["Product Visualization", "Cosmetics"],
    coverInGallery: true,
  },
  {
    slug: "riesling-luxembourg",
    title: "Riesling — Luxembourg",
    description:
      "Wine-bottle visualisation of a Luxembourg Riesling — high-resolution beauty and wireframe renders.",
    cover: "/productions/riesling-luxembourg/cover.webp",
    year: 2026,
    category: "product-visualisation",
    tags: ["Product Visualization", "3D Render"],
    coverInGallery: true,
  },
  {
    slug: "l-u-x-proaging",
    title: "L.U.X ProAging",
    description:
      "Skincare-bottle visualisation for \"L.U.X ProAging\" — studio render and wireframe.",
    cover: "/productions/l-u-x-proaging/cover.webp",
    year: 2026,
    category: "product-visualisation",
    tags: ["Product Visualization", "Cosmetics"],
    coverInGallery: true,
  },
  {
    slug: "natuargua-collection-844",
    title: "Natuargua Collection 844",
    description:
      "Product render of the Natuargua Collection 844 bottle, with a wireframe pass.",
    cover: "/productions/natuargua-collection-844/cover.webp",
    year: 2026,
    category: "product-visualisation",
    tags: ["Product Visualization", "3D Render"],
    coverInGallery: true,
  },
  {
    slug: "91-1-herbal-serum",
    title: "91.1 Herbal Serum",
    description:
      "Serum-bottle visualisation for \"91.1 Herbal Serum\" — beauty and wireframe renders.",
    cover: "/productions/91-1-herbal-serum/cover.webp",
    year: 2026,
    category: "product-visualisation",
    tags: ["Product Visualization", "Cosmetics"],
    coverInGallery: true,
  },
  {
    slug: "carl-fredricksen",
    title: "Carl Fredricksen — UP",
    description:
      "A 3D bust of Carl Fredricksen from Pixar's UP — a full texture and shading study, from base color through roughness and normal passes.",
    cover: "/productions/carl-fredricksen/cover.jpg",
    year: 2020,
    category: "productions",
    tags: ["Character Art", "Fan Art"],
  },
];
