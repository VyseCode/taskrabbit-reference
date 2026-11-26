export const CATEGORIES = [
  { slug: "cleaning", name: "Cleaning", description: "Homes and offices, spotless." },
  { slug: "moving", name: "Moving", description: "Lifting, packing and transport help." },
  { slug: "handyman", name: "Handyman", description: "Small repairs and fixes." },
  { slug: "plumbing", name: "Plumbing", description: "Leaks, taps and pipework." },
  { slug: "electrical", name: "Electrical", description: "Lighting, outlets and installs." },
  { slug: "painting", name: "Painting", description: "Interior and exterior paint." },
  { slug: "gardening", name: "Gardening", description: "Lawns, plants and outdoor care." },
  { slug: "tutoring", name: "Tutoring", description: "One-to-one academic help." },
  { slug: "pet-care", name: "Pet Care", description: "Walking and sitting for pets." },
  { slug: "delivery", name: "Delivery", description: "Pick-ups and local errands." },
] as const;

export const CATEGORY_SLUGS = CATEGORIES.map((category) => category.slug) as [
  (typeof CATEGORIES)[number]["slug"],
  ...(typeof CATEGORIES)[number]["slug"][],
];

export function categoryName(slug: string): string {
  return CATEGORIES.find((category) => category.slug === slug)?.name ?? slug;
}
