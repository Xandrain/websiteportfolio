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
  /** Show the "Interactive" badge on the card (has an in-page 3D/scrub viewer). */
  viewer?: boolean;
  /**
   * WebP image sequence for the interactive viewer.
   *
   * How to add a sequence
   * ─────────────────────
   * 1. Export your frames as WebP: 0001.webp, 0002.webp, … (zero-padded, 4 digits)
   * 2. Drop the folder into /public/sequences/<slug>/
   * 3. Fill in the fields below.
   *
   * Example folder structure:
   *   public/sequences/<slug>/0001.webp
   *   public/sequences/<slug>/0002.webp
   *   …
   *   public/sequences/<slug>/0120.webp
   */
  sequence?: {
    basePath: string;   // e.g. "/sequences/<slug>/"
    frameCount: number; // total number of frames
    fps?: number;       // playback speed — default 24
  };
  images?: string[];
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
    images: [
      "/productions/mojo-swoptops/01.gif",
      "/productions/mojo-swoptops/02.gif",
      "/productions/mojo-swoptops/03.gif",
    ],
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
    images: [
      "/productions/azureus/01.jpg",
      "/productions/azureus/02.jpg",
      "/productions/azureus/03.jpg",
    ],
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
    images: [
      "/productions/crown-reinterpretation/01.jpg",
      "/productions/crown-reinterpretation/02.jpg",
      "/productions/crown-reinterpretation/03.jpg",
    ],
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
    images: [
      "/productions/rambochador/01.jpg",
      "/productions/rambochador/02.jpg",
      "/productions/rambochador/03.jpg",
    ],
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
    images: [
      "/productions/chance-parfume/01.jpg",
      "/productions/chance-parfume/02.jpg",
    ],
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
    images: [
      "/productions/vermouth-rosso/cover.webp",
      "/productions/vermouth-rosso/01.webp",
      "/productions/vermouth-rosso/02.webp",
      "/productions/vermouth-rosso/03.webp",
      "/productions/vermouth-rosso/04.webp",
    ],
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
    images: [
      "/productions/half-moon-eau-de-parfum/cover.webp",
      "/productions/half-moon-eau-de-parfum/01.webp",
      "/productions/half-moon-eau-de-parfum/02.webp",
    ],
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
    images: [
      "/productions/avocado-lms-bio/cover.webp",
      "/productions/avocado-lms-bio/01.webp",
      "/productions/avocado-lms-bio/02.webp",
    ],
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
    images: [
      "/productions/emperor-orange-lime/cover.webp",
      "/productions/emperor-orange-lime/01.webp",
      "/productions/emperor-orange-lime/02.webp",
    ],
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
    images: [
      "/productions/lulu-acidoactive/cover.webp",
      "/productions/lulu-acidoactive/01.webp",
      "/productions/lulu-acidoactive/02.webp",
    ],
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
    images: [
      "/productions/riesling-luxembourg/cover.webp",
      "/productions/riesling-luxembourg/01.webp",
    ],
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
    images: [
      "/productions/l-u-x-proaging/cover.webp",
      "/productions/l-u-x-proaging/01.webp",
    ],
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
    images: [
      "/productions/natuargua-collection-844/cover.webp",
      "/productions/natuargua-collection-844/01.webp",
    ],
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
    images: [
      "/productions/91-1-herbal-serum/cover.webp",
      "/productions/91-1-herbal-serum/01.webp",
    ],
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
    images: [
      "/productions/carl-fredricksen/01.jpg",
      "/productions/carl-fredricksen/02.jpg",
      "/productions/carl-fredricksen/03.jpg",
    ],
  },
];
