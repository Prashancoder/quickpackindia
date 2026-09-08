import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CTASection } from "@/components/CTASection";
import {
  categories,
  filters as basePills,
  matchesFilter,
  matchesSearch,
  products,
  productsByCategory,
  type FilterId,
  type Product,
} from "@/data/products";

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      {
        title:
          "Packaging Products | Corrugated Boxes, Mailer Boxes & Mono Cartons | QuickPack India",
      },
      {
        name: "description",
        content:
          "Explore QuickPack India's range of corrugated boxes, mailer boxes, mono cartons, paper bags and custom packaging solutions.",
      },
      { property: "og:title", content: "Packaging Products | QuickPack India" },
      {
        property: "og:description",
        content:
          "Corrugated boxes, mailer boxes, mono cartons, paper bags and custom packaging solutions from QuickPack India.",
      },
      { property: "og:url", content: "/products" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  component: ProductsPage,
});

const pills: { id: FilterId; label: string }[] = [
  basePills[0],
  { id: "corrugated-packing-boxes", label: "Corrugated Packing Boxes" },
  ...basePills.slice(1),
];

function CategorySection({
  title,
  description,
  items,
  initial,
  headingLevel = "h2",
}: {
  title: string;
  description?: string;
  items: Product[];
  initial: number;
  headingLevel?: "h2";
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, initial);
  const Heading = headingLevel;

  if (items.length === 0) return null;

  return (
    <section className="mt-14">
      <Heading className="text-xl font-bold md:text-2xl">{title}</Heading>
      {description && (
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {items.length > initial && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md border border-border bg-card px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
          >
            {expanded ? "Show Less" : "View More"}
          </button>
        </div>
      )}
    </section>
  );
}

function ProductsPage() {
  const { category } = Route.useSearch();
  const navigate = useNavigate({ from: "/products" });
  const [query, setQuery] = useState("");

  const activeFilter = (category ?? "all") as FilterId;

  const setFilter = (id: FilterId) =>
    navigate({
      search: () => ({ category: id === "all" ? undefined : id }),
    });

  const filtered = useMemo(
    () =>
      products.filter(
        (p) => matchesFilter(p, activeFilter) && matchesSearch(p, query),
      ),
    [activeFilter, query],
  );

  const showSections = activeFilter === "all" && query.trim() === "";

  return (
    <div className="container-page py-10 md:py-14">
      <header className="max-w-3xl">
        <p className="text-xs font-bold tracking-wider text-primary uppercase">Products</p>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">
          Explore Our Complete Packaging Range
        </h1>
        <p className="mt-3 text-muted-foreground">
          Discover reliable corrugated boxes, mailer boxes, mono cartons, paper bags and
          other packaging solutions designed for different business needs.
        </p>
      </header>

      {/* Search */}
      <div className="relative mt-8">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or size..."
          aria-label="Search products"
          className="h-14 w-full rounded-xl border border-border bg-card pr-4 pl-12 text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
        />
      </div>

      {/* Filters */}
      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {pills.map((pill) => {
          const active = pill.id === activeFilter;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => setFilter(pill.id)}
              aria-pressed={active}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {showSections ? (
        categories.map((cat) => (
          <CategorySection
            key={cat.id}
            title={cat.name}
            description={cat.description}
            items={productsByCategory(cat.id)}
            initial={cat.id === "premium-mailer-boxes" ? 4 : 8}
          />
        ))
      ) : filtered.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold">
            {filtered.length} product{filtered.length === 1 ? "" : "s"} found
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : (
        <div className="mt-16 rounded-xl border border-dashed border-border bg-surface p-12 text-center">
          <h2 className="text-lg font-bold">No products found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different search term or clear your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <X className="size-4" aria-hidden="true" />
            Clear search & filters
          </button>
        </div>
      )}

      <CTASection
        title="Need Custom Packaging?"
        text="Tell us what you need and our team can help you find the right packaging solution for your business."
      />
    </div>
  );
}
