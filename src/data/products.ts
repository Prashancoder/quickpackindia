import corrugatedImg from "@/assets/corrugated-boxes.jpg";
import paperBagImg from "@/assets/paper-bags.jpg";
import mailerImg from "@/assets/mailer-boxes.jpg";
import monoCartonImg from "@/assets/mono-carton.jpg";
import otherImg from "@/assets/other-products.jpg";

/**
 * SINGLE SOURCE OF TRUTH for all QuickPack India product data.
 * The navbar mega-menu, /products catalogue, filters, cards and the
 * product detail route all derive from this file. Add a product here and
 * it appears everywhere automatically.
 */

export type CategoryId =
  | "corrugated-packing-boxes"
  | "paper-bags"
  | "premium-mailer-boxes"
  | "mono-carton-packaging-boxes"
  | "other-products";

export type Product = {
  id: string;
  name: string;
  slug: string;
  category: CategoryId;
  image: string;
  description: string;
  size?: string;
  /** Extra filter tags used by the pill filters on /products */
  tags?: string[];
};

export type Category = {
  id: CategoryId;
  name: string;
  description: string;
  image: string;
};

export const categories: Category[] = [
  {
    id: "corrugated-packing-boxes",
    name: "Corrugated Packing Boxes",
    description:
      "Reliable corrugated packaging solutions designed for shipping, storage and product protection across different business requirements.",
    image: corrugatedImg,
  },
  {
    id: "paper-bags",
    name: "Paper Bags",
    description:
      "Kraft and printed paper bags for retail, takeaway and brand packaging needs.",
    image: paperBagImg,
  },
  {
    id: "premium-mailer-boxes",
    name: "Premium Mailer Boxes",
    description:
      "Sturdy flip-lid mailer boxes built for e-commerce shipping and premium unboxing.",
    image: mailerImg,
  },
  {
    id: "mono-carton-packaging-boxes",
    name: "Mono Carton Packaging Boxes",
    description:
      "Printed duplex and folding mono cartons for retail-ready product packaging.",
    image: monoCartonImg,
  },
  {
    id: "other-products",
    name: "Other Products",
    description:
      "Supporting print and packaging accessories that complete your unboxing experience.",
    image: otherImg,
  },
];

const p = (
  name: string,
  category: CategoryId,
  image: string,
  description: string,
  tags: string[] = [],
  size?: string,
): Product => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  category,
  image,
  description,
  size,
  tags,
});

export const products: Product[] = [
  // Corrugated Packing Boxes
  p(
    "3 Ply Corrugated Box",
    "corrugated-packing-boxes",
    corrugatedImg,
    "Light-duty 3 ply corrugated box suited to e-commerce shipping of lightweight goods, documents and accessories. Available in custom sizes.",
    ["3-ply"],
    "Custom sizes available",
  ),
  p(
    "5 Ply Corrugated Box",
    "corrugated-packing-boxes",
    corrugatedImg,
    "5 ply corrugated box with an extra fluted layer for improved stacking strength and transit protection of medium-weight products.",
    ["5-ply"],
    "Custom sizes available",
  ),
  p(
    "7 Ply Corrugated Box",
    "corrugated-packing-boxes",
    corrugatedImg,
    "Heavy-grade 7 ply corrugated box for bulk shipments, industrial parts and long-distance transit.",
    [],
    "Custom sizes available",
  ),
  p(
    "9 Ply Corrugated Box",
    "corrugated-packing-boxes",
    corrugatedImg,
    "Maximum-strength 9 ply corrugated box engineered for heavy loads and demanding logistics conditions.",
    [],
    "Custom sizes available",
  ),
  p(
    "Corrugated Carton Box",
    "corrugated-packing-boxes",
    corrugatedImg,
    "General-purpose corrugated carton box for packing, storage and dispatch across industries.",
    [],
  ),
  p(
    "Corrugated Packaging Box",
    "corrugated-packing-boxes",
    corrugatedImg,
    "Standard corrugated packaging box manufactured to your required dimensions and ply strength.",
    [],
  ),
  p(
    "Custom Corrugated Box",
    "corrugated-packing-boxes",
    corrugatedImg,
    "Made-to-order corrugated box built around your product dimensions, ply requirement and print needs.",
    ["die-cut"],
  ),
  p(
    "Heavy Duty Corrugated Box",
    "corrugated-packing-boxes",
    corrugatedImg,
    "Reinforced corrugated box for heavier consignments where stacking strength and edge crush resistance matter.",
    [],
  ),
  p(
    "Industrial 7 Ply Corrugated Box",
    "corrugated-packing-boxes",
    corrugatedImg,
    "Industrial-grade 7 ply box for machinery components, spares and factory dispatch.",
    [],
  ),
  p(
    "Multi Layer Corrugated Box",
    "corrugated-packing-boxes",
    corrugatedImg,
    "Multi layer construction combining several fluted walls for superior cushioning and protection.",
    [],
  ),
  p(
    "Premium Imported Kraft Corrugated Boxes",
    "corrugated-packing-boxes",
    corrugatedImg,
    "Corrugated boxes made with imported kraft liner for a cleaner finish and consistent strength.",
    [],
  ),
  p(
    "Printed Corrugated Box",
    "corrugated-packing-boxes",
    corrugatedImg,
    "Corrugated box with brand printing — logo, artwork and handling instructions applied to your specification.",
    ["printed"],
  ),

  // Paper Bags
  p(
    "Eco Friendly Paper Bag",
    "paper-bags",
    paperBagImg,
    "Recyclable kraft paper bag with twisted handles for retail and takeaway use.",
    [],
  ),
  p(
    "Printed Paper Bag",
    "paper-bags",
    paperBagImg,
    "Paper bag printed with your brand identity for retail counters, events and gifting.",
    ["printed"],
  ),

  // Premium Mailer Boxes
  p(
    "Corrugated Mailer Box",
    "premium-mailer-boxes",
    mailerImg,
    "Corrugated flip-lid mailer box that ships flat and locks securely without tape.",
    [],
  ),
  p(
    "Custom Mailer Box",
    "premium-mailer-boxes",
    mailerImg,
    "Mailer box built to your exact product dimensions with optional branding.",
    ["die-cut"],
  ),
  p(
    "Folding Mailer Box",
    "premium-mailer-boxes",
    mailerImg,
    "Die-cut folding mailer box for quick assembly and space-efficient storage.",
    ["die-cut"],
  ),
  p(
    "Kraft Mailer Box",
    "premium-mailer-boxes",
    mailerImg,
    "Natural kraft mailer box with a clean, minimal unboxing feel.",
    [],
  ),
  p(
    "Luxury Packaging Mailer Box",
    "premium-mailer-boxes",
    mailerImg,
    "Premium finish mailer box for gifting, subscription boxes and high-value products.",
    ["printed"],
  ),

  // Mono Carton Packaging Boxes
  p(
    "Cosmetic Mono Carton Box",
    "mono-carton-packaging-boxes",
    monoCartonImg,
    "Printed mono carton for cosmetics and personal care products, shelf-ready and lightweight.",
    ["printed"],
  ),
  p(
    "Earpod Mono Carton Packaging Box",
    "mono-carton-packaging-boxes",
    monoCartonImg,
    "Compact mono carton designed for earpods and small electronics accessories.",
    [],
  ),
  p(
    "Mono Carton Packaging Box",
    "mono-carton-packaging-boxes",
    monoCartonImg,
    "Standard duplex board mono carton for retail product packaging.",
    [],
  ),
  p(
    "Printed Mono Carton Box",
    "mono-carton-packaging-boxes",
    monoCartonImg,
    "Full-colour printed mono carton that carries your artwork and product information.",
    ["printed"],
  ),

  // Other Products
  p(
    "Thank You Card",
    "other-products",
    otherImg,
    "Printed thank you card to add a personal touch inside every shipment.",
    ["printed"],
  ),
  p(
    "Premium Business Card",
    "other-products",
    otherImg,
    "Premium finish business cards printed on quality board stock.",
    ["printed"],
  ),
  p(
    "Shredded Paper",
    "other-products",
    otherImg,
    "Shredded paper filler that cushions products and elevates the unboxing experience.",
    [],
  ),
  p(
    "Round Paper Sticker",
    "other-products",
    otherImg,
    "Round paper stickers for sealing boxes, bags and mailers with your brand mark.",
    ["printed"],
  ),
  p(
    "Promotional Paper Pamphlet",
    "other-products",
    otherImg,
    "Printed pamphlets and inserts to promote offers alongside your order.",
    ["printed"],
  ),
];

export const getCategory = (id: CategoryId) =>
  categories.find((c) => c.id === id)!;

export const productsByCategory = (id: CategoryId) =>
  products.filter((prod) => prod.category === id);

export const getProductBySlug = (slug: string) =>
  products.find((prod) => prod.slug === slug);

/** Pill filters on /products. Each maps to a predicate over the catalogue. */
export type FilterId =
  | "all"
  | "3-ply"
  | "5-ply"
  | "die-cut"
  | "printed"
  | CategoryId;

export const filters: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "3-ply", label: "3 Ply Corrugated Boxes" },
  { id: "5-ply", label: "5 Ply Corrugated Boxes" },
  { id: "die-cut", label: "Die Cut & Folding Boxes" },
  { id: "printed", label: "Printed Packaging Boxes" },
  { id: "premium-mailer-boxes", label: "Mailer Boxes" },
  { id: "mono-carton-packaging-boxes", label: "Mono Carton Packaging" },
  { id: "paper-bags", label: "Paper Bags" },
  { id: "other-products", label: "Other Products" },
];

export function matchesFilter(product: Product, filter: FilterId) {
  if (filter === "all") return true;
  if (product.category === filter) return true;
  return (product.tags ?? []).includes(filter);
}

export function matchesSearch(product: Product, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    product.name,
    getCategory(product.category).name,
    product.description,
    product.size ?? "",
    ...(product.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}
