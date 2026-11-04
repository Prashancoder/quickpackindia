import { useEffect, useState, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CTASection } from "@/components/CTASection";
import { api } from "@/lib/api";
import { categories as defaultCategories } from "@/data/products";

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: typeof search.category === "string" ? search.category : undefined,
    search: typeof search.search === "string" ? search.search : undefined,
    sort: typeof search.sort === "string" ? search.sort : undefined,
  }),
  head: () => ({
    meta: [
      {
        title: "All Packaging Products Catalogue | Corrugated, Mailers & Cartons | QuickPack India",
      },
      {
        name: "description",
        content:
          "Explore QuickPack India's complete range of 3-ply & 5-ply corrugated boxes, die-cut mailer boxes, mono cartons and paper carry bags with factory direct pricing.",
      },
      { property: "og:title", content: "Packaging Products Catalogue | QuickPack India" },
      {
        property: "og:description",
        content:
          "Factory-direct corrugated boxes, mailer boxes, mono cartons and paper bags.",
      },
      { property: "og:url", content: "/products" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { category: queryCategory, search: querySearch, sort: querySort } = Route.useSearch();
  const navigate = useNavigate({ from: "/products" });

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(querySearch || "");
  const [activeSort, setActiveSort] = useState(querySort || "featured");

  const activeCategory = queryCategory || "all";

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({
          category: activeCategory !== "all" ? activeCategory : undefined,
          search: searchTerm.trim() || undefined,
          sort: activeSort,
          limit: 50,
        }),
        api.getCategories(),
      ]);

      if (prodRes.success && prodRes.products) {
        setProducts(prodRes.products);
      }
      if (catRes.success && catRes.categories?.length > 0) {
        setCategories(catRes.categories);
      }
    } catch (err) {
      console.warn("Failed to fetch products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeCategory, activeSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleCategoryChange = (slug: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        category: slug === "all" ? undefined : slug,
      }),
    });
  };

  const handleSortChange = (newSort: string) => {
    setActiveSort(newSort);
    navigate({
      search: (prev) => ({
        ...prev,
        sort: newSort === "featured" ? undefined : newSort,
      }),
    });
  };

  return (
    <div className="container-page py-10 md:py-14">
      {/* Header */}
      <header className="max-w-3xl">
        <span className="text-xs font-bold tracking-wider text-primary uppercase">
          Factory Direct Catalogue
        </span>
        <h1 className="mt-2 text-3xl font-extrabold md:text-4xl text-foreground">
          Packaging Boxes &amp; Materials
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Select from our production range of corrugated shipping cartons, premium flip-lid mailers,
          folding mono cartons, and retail bags. Dynamic variant pricing and instant volume discounts.
        </p>
      </header>

      {/* Search & Sort Controls */}
      <div className="mt-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by box size, name, ply (e.g. 4x4x1.5, 3-ply, mailer)..."
            className="h-12 w-full rounded-xl border border-border bg-card pr-24 pl-11 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
          <button
            type="submit"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
          >
            Search
          </button>
        </form>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="size-4 text-muted-foreground" />
          <select
            value={activeSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="h-12 rounded-xl border border-border bg-card px-4 text-sm font-semibold outline-none focus:border-primary"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
            <option value="newest">Newest Additions</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="no-scrollbar mt-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0">
        <button
          type="button"
          onClick={() => handleCategoryChange("all")}
          className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
            activeCategory === "all"
              ? "border-primary bg-primary text-primary-foreground shadow-xs"
              : "border-border bg-card text-foreground hover:bg-accent"
          }`}
        >
          All Products
        </button>

        {categories.map((cat) => {
          const slug = cat.slug || cat.id;
          const active = activeCategory === slug;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => handleCategoryChange(slug)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-colors ${
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-88 rounded-2xl border border-border bg-card p-4 animate-pulse"
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div>
            <p className="mb-4 text-xs font-semibold text-muted-foreground">
              Showing {products.length} product{products.length === 1 ? "" : "s"}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p._id || p.id} product={p} />
              ))}
            </div>
          </div>
        ) : (
          <div className="my-16 rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <h3 className="text-base font-bold text-foreground">No matching products found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try adjusting your search query or select another category.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                handleCategoryChange("all");
              }}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs"
            >
              <X className="size-4" />
              Clear Filters &amp; Search
            </button>
          </div>
        )}
      </div>

      <CTASection
        title="Custom Size or Logo Printing Required?"
        text="QuickPack India manufactures made-to-order corrugated cartons, duplex boxes and mailers to your exact CAD specs."
      />
    </div>
  );
}
