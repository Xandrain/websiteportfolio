export interface Photo {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Collection {
  slug: string;
  title: string;
  description: string;
  cover: string;
  category: string;
  year: number;
  photos: Photo[];
}

/**
 * To add a new collection: append an object below.
 * For local images, place them in /public/photography/ and use "/photography/filename.jpg" as the src.
 */
export const collections: Collection[] = [
  {
    slug: "northern-light",
    title: "Northern Light",
    description:
      "A study in winter light and open horizon. Landscapes from Iceland and northern Norway, made during the blue hour and the long silences that follow.",
    cover: "/photography/nl-cover.jpg",
    category: "Landscape",
    year: 2024,
    photos: [
      { src: "/photography/nl1.jpg", alt: "Vast snow plain under pale winter sky", width: 1600, height: 1067 },
      { src: "/photography/nl2.jpg", alt: "Frozen lake edge at dusk, soft blue light", width: 1067, height: 1600 },
      { src: "/photography/nl3.jpg", alt: "Mountain silhouette against pale horizon", width: 1600, height: 1067 },
      { src: "/photography/nl4.jpg", alt: "Windswept tree on open tundra", width: 1600, height: 1067 },
      { src: "/photography/nl5.jpg", alt: "Coastal rocks under overcast light", width: 1067, height: 1600 },
      { src: "/photography/nl6.jpg", alt: "Reflections in a still arctic pool", width: 1600, height: 1067 },
    ],
  },
  {
    slug: "in-the-studio",
    title: "In the Studio",
    description:
      "Single-light portrait work made slowly, in quiet. Each sitting a collaboration — restraint as the shared language.",
    cover: "/photography/studio-cover.jpg",
    category: "Portrait",
    year: 2024,
    photos: [
      { src: "/photography/st1.jpg", alt: "Portrait lit from a single window", width: 1067, height: 1600 },
      { src: "/photography/st2.jpg", alt: "Subject in profile, soft side light", width: 1067, height: 1600 },
      { src: "/photography/st3.jpg", alt: "Hands resting on a table, natural light", width: 1600, height: 1067 },
      { src: "/photography/st4.jpg", alt: "Close study, face partially in shadow", width: 1067, height: 1600 },
      { src: "/photography/st5.jpg", alt: "Figure by a window, city blurred behind", width: 1067, height: 1600 },
      { src: "/photography/st6.jpg", alt: "Two subjects, quiet moment between them", width: 1600, height: 1067 },
    ],
  },
  {
    slug: "concrete-and-glass",
    title: "Concrete & Glass",
    description:
      "Architecture as light trap. Buildings photographed for the geometry they make of the sky — angles, voids, and the slow passage of shadows.",
    cover: "/photography/arch-cover.jpg",
    category: "Architecture",
    year: 2023,
    photos: [
      { src: "/photography/ar1.jpg", alt: "Looking up through a concrete atrium", width: 1600, height: 1067 },
      { src: "/photography/ar2.jpg", alt: "Glazed facade reflecting an overcast sky", width: 1067, height: 1600 },
      { src: "/photography/ar3.jpg", alt: "Stairwell, hard angles in afternoon light", width: 1600, height: 1067 },
      { src: "/photography/ar4.jpg", alt: "Shadow grid cast through a window", width: 1600, height: 1067 },
      { src: "/photography/ar5.jpg", alt: "Narrow passage between two concrete walls", width: 1067, height: 1600 },
      { src: "/photography/ar6.jpg", alt: "Roofline at dusk, clean horizon cut", width: 1600, height: 1067 },
    ],
  },
  {
    slug: "field-notes",
    title: "Field Notes",
    description:
      "Documents made in transit. Not destinations but the moments between them — peripheral light, unglamorous subjects, quiet hours.",
    cover: "/photography/field-cover.jpg",
    category: "Documentary",
    year: 2023,
    photos: [
      { src: "/photography/fn1.jpg", alt: "Early morning platform, no passengers", width: 1600, height: 1067 },
      { src: "/photography/fn2.jpg", alt: "Café window condensation, street beyond", width: 1067, height: 1600 },
      { src: "/photography/fn3.jpg", alt: "Rain on a car roof, streetlight reflection", width: 1600, height: 1067 },
      { src: "/photography/fn4.jpg", alt: "Open notebook on a train table", width: 1067, height: 1600 },
      { src: "/photography/fn5.jpg", alt: "Roadside verge at golden hour", width: 1600, height: 1067 },
      { src: "/photography/fn6.jpg", alt: "Overpass shadow on an empty road", width: 1600, height: 1067 },
    ],
  },
];
