/**
 * Default content — the website exactly as it was before the CMS.
 *
 * Used by the PUBLIC site only, when Supabase is not configured, unreachable,
 * or a collection has never been populated. Admin screens never show these as
 * if they were saved records. "Import current site content" in the dashboard
 * copies them into the database (non-destructively).
 */
import {
  DEFAULT_ID_PREFIX,
  type GalleryCollection,
  type GalleryImage,
  type Project,
  type Slide,
} from "./types";

const assetModules = import.meta.glob<string>("../../assets/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
});

const assetsByName: Record<string, string> = {};
for (const [path, url] of Object.entries(assetModules)) {
  assetsByName[path.split("/").pop()!] = url;
}

/** URL of a bundled asset in src/assets by file name. */
export function asset(name: string): string {
  const url = assetsByName[name];
  if (!url) throw new Error(`Missing bundled asset: ${name}`);
  return url;
}

/** Reverse lookup: bundled asset URL → file name (used by the importer). */
export function assetNameFromUrl(url: string): string | null {
  for (const [name, u] of Object.entries(assetsByName)) if (u === url) return name;
  return null;
}

const EPOCH = "2026-01-01T00:00:00.000Z";

type SlideSpec = [file: string, alt: string, opts?: Partial<Omit<Slide, "url" | "alt">>];

function slides(specs: SlideSpec[]): Slide[] {
  return specs.map(([file, alt, opts]) => ({
    url: asset(file),
    path: null,
    alt,
    fit: opts?.fit ?? "cover",
    enhance: opts?.enhance ?? false,
    position: opts?.position ?? "center",
    bg: opts?.bg ?? null,
  }));
}

const sketch = { fit: "contain", enhance: true } as const;

const projectSpecs: Array<{
  title: string;
  slug: string;
  cover: string;
  description: string;
  gallery: SlideSpec[];
}> = [
  {
    title: "Pattern Blocks",
    slug: "pattern-blocks",
    cover: "pattern-blocks.jpg",
    description:
      "These classic wooden blocks are designed to have endless pattern possibilities. Each block has three different patterns and stained contrast to aid in pattern recognition and spatial recognition skills.",
    gallery: [
      ["pattern-blocks-3.jpg", "Wooden geometric Pattern Blocks"],
      ["pattern-blocks-1.jpg", "Pattern Blocks possible product line drawing", sketch],
      ["pattern-blocks-4.jpg", "Pattern Blocks ideation sketches", sketch],
      ["pattern-blocks-2.jpg", "Child playing with Pattern Blocks outdoors"],
    ],
  },
  {
    title: "Sand City",
    slug: "sand-city",
    cover: "sand-city.jpg",
    description:
      "Sand City was inspired by sand castle molds. The market is so flooded with castle-themed sand toys, which are not relatable to children. Sand City enables children to make their own city at the beach with four unique city-building shaped molds.",
    gallery: [
      ["sand-city-4.jpg", "Colorful Sand City molds stacked"],
      ["sand-city-1.jpg", "Sand City ideation sketches", sketch],
      ["sand-city-2.jpg", "Sand City possible product line drawing", sketch],
      ["sand-city-3.jpg", "Children playing with Sand City molds at the beach"],
    ],
  },
  {
    title: "Hideout Desk",
    slug: "hideout-desk",
    cover: "hideout-desk.jpg",
    description:
      "Desk meets fort in this child's desk. Shutters attached to all legs create a great place to hide out. An overhang on one side allows the child to sit at the desk without damaging the shutter. Imaginative play has never been easier to foster.",
    gallery: [
      ["hideout-desk-1.jpg", "Hideout Desk with green shuttered legs outdoors"],
      ["hideout-desk-2.jpg", "Hideout Desk ideation sketches", sketch],
      ["hideout-desk-3.jpg", "Hideout Desk possible product line drawing", sketch],
      ["hideout-desk-4.jpg", "Child sitting at the Hideout Desk outdoors", { position: "top" }],
    ],
  },
  {
    title: "Scooplas",
    slug: "scooplas",
    cover: "scooplas.jpg",
    description:
      "The age-old problem of getting kids to pick up their toys just got a little easier. Scooplas are light, have easy-to-use mittens, and are flat on the bottom, making them very effective at scooping toys off the floor.",
    gallery: [
      [
        "scooplas-1.jpg",
        "White rounded mitten-form Scooplas product",
        { fit: "contain", bg: "#F0EBE3" },
      ],
      ["scooplas-2.jpg", "Scooplas ideation sketches", sketch],
      ["scooplas-3.jpg", "Scooplas product line possibilities drawing", sketch],
      ["scooplas-4.jpg", "Child using Scooplas to scoop up toys"],
    ],
  },
  {
    title: "My Little Rocket",
    slug: "my-little-rocket",
    cover: "my-little-rocket.jpg",
    description:
      "Ever noticed how the large box that something was packaged in is often more entertaining than the toy itself? With My Little Rocket, the box is the toy. It unfolds into a spaceship big enough for children to play in, with pop-out cardboard pieces that connect like puzzle pieces to create stackable alien creatures.",
    gallery: [
      ["my-little-rocket-1.jpg", "Cardboard My Little Rocket toy with red interior"],
      ["my-little-rocket-2.jpg", "My Little Rocket ideation sketches", sketch],
      ["my-little-rocket-3.jpg", "My Little Rocket in-use and product line drawing", sketch],
      ["my-little-rocket-4.jpg", "My Little Rocket possible product line drawing", sketch],
    ],
  },
  {
    title: "Shirt Wings",
    slug: "shirt-wings",
    cover: "shirt-wings.jpg",
    description:
      "Using conventional coat hangers is not easy for children. Shirt Wings are made with kids in mind. A gear mechanism allows the dragonfly-shaped wings to go up and down. When wings are down they fit in the neck of a shirt, then a pull of the hook raises them to hold the shirt in place, building independence and eye-hand coordination.",
    gallery: [
      ["shirt-wings-1.jpg", "Wooden dragonfly-shaped Shirt Wings hanger"],
      ["shirt-wings-2.jpg", "Shirt Wings gear mechanism sketch", sketch],
      ["shirt-wings-3.jpg", "Shirt Wings how-it-works diagram", sketch],
      ["shirt-wings-4.jpg", "Shirt Wings possible product line drawing", sketch],
      ["shirt-wings-5.jpg", "Child using Shirt Wings hanger to hang a shirt", { fit: "contain" }],
    ],
  },
  {
    title: "Toddler Activity Boards",
    slug: "toddler-activity-boards",
    cover: "activity-board.jpg",
    description:
      "These activity boards keep curious toddlers busy for hours. They are all cut to be interchangeable and fit an existing hanging system, so when children get bored with one, simply swap it out for another. Fine motor skills, color and shape matching, and number recognition are among the skills learned through play.",
    gallery: [
      ["activity-board-1.jpg", "Colorful Toddler Activity Board with rainbow elements"],
      ["activity-board-2.jpg", "Activity board with latches, buckles, locks, and gears"],
      ["activity-board-3.jpg", "Activity board with painted circles and sensory elements"],
      ["activity-board-4.jpg", "Activity board variation with mechanical elements"],
      ["activity-board-5.jpg", "Activity board variation with different arrangements"],
      ["activity-board-6.jpg", "Children playing with the activity board", { position: "top" }],
    ],
  },
];

export const defaultProjects: Project[] = projectSpecs.map((p, i) => ({
  id: `${DEFAULT_ID_PREFIX}project:${p.slug}`,
  title: p.title,
  slug: p.slug,
  description: p.description,
  category: "industrial-design",
  tags: [],
  cover_image: asset(p.cover),
  gallery: slides(p.gallery),
  featured: true,
  published: true,
  sort_order: i * 10,
  created_at: EPOCH,
  updated_at: EPOCH,
}));

function galleryDefaults(
  collection: GalleryCollection,
  prefix: string,
  count: number,
): GalleryImage[] {
  return Array.from({ length: count }, (_, i) => {
    const file = `${prefix}-${i + 1}.jpg`;
    return {
      id: `${DEFAULT_ID_PREFIX}gallery:${collection}/${file}`,
      collection,
      image_url: asset(file),
      image_path: null,
      alt: "",
      caption: "",
      seed_key: `${collection}/${file}`,
      published: true,
      sort_order: i * 10,
      created_at: EPOCH,
      updated_at: EPOCH,
    };
  });
}

export const defaultGalleries: Record<GalleryCollection, GalleryImage[]> = {
  "soft-goods": galleryDefaults("soft-goods", "sg", 30),
  "other-work": galleryDefaults("other-work", "ow", 9),
};
