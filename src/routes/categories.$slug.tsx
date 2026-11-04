import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, SlidersHorizontal, Package, ArrowRight, CheckCircle2 } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { CTASection } from "@/components/CTASection";
import { api } from "@/lib/api";

export const Route = createFileRoute("/categories/$slug")({
  head: ({ params }) => {
    const formatted = params.slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      meta: [
        {
          title: `${formatted} Manufacturer & Wholesale Supplier | QuickPack India`,
        },
        {
          name: "description",
          content: `Buy high-quality ${formatted} directly from the manufacturer. Factory-direct pricing, custom sizes, bulk supply with Pan India delivery.`,
        },
        { property: "og:title", content: `${formatted} | QuickPack India` },
        { property: "og:type", content: "website" },
      ],
      links: [{ rel: "canonical", href: `/categories/${params.slug}` }],
    };
  },
  component: CategoryProductsPage,
});

function CategoryProductsPage() {
  const { slug } = Route.useParams();
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.getCategoryBySlug(slug).catch(() => null),
      api.getProducts({ category: slug, sort, limit: 50 }).catch(() => null),
    ])
      .then(([catRes, prodRes]) => {
        if (catRes?.success && catRes.category) {
          setCategory(catRes.category);
        } else {
          // Fallback title from slug
          const title = slug
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          setCategory({ name: title, slug, description: `Factory-direct ${title} manufactured to industrial specifications.` });
        }

        if (prodRes?.success && prodRes.products) {
          setProducts(prodRes.products);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug, sort]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Category Hero Header */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-xs text-amber-200 mb-4">
            <Link to="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:underline">Products</Link>
            <span>/</span>
            <span className="text-white font-medium">{category?.name || slug}</span>
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {category?.name || "Packaging Category"}
            </h1>
            <p className="mt-3 text-sm sm:text-base text-amber-100 leading-relaxed">
              {category?.description ||
                "Engineered packaging manufactured with virgin paper kraft fluting and precision die-cutting. Order standard sizes online or request custom dimensions."}
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-xs bg-amber-900/60 px-3 py-1.5 rounded-full border border-amber-500/30">
                <CheckCircle2 className="h-4 w-4 text-amber-400" /> Factory Direct Pricing
              </div>
              <div className="flex items-center gap-2 text-xs bg-amber-900/60 px-3 py-1.5 rounded-full border border-amber-500/30">
                <CheckCircle2 className="h-4 w-4 text-amber-400" /> Pan-India Commercial Transit
              </div>
              <div className="flex items-center gap-2 text-xs bg-amber-900/60 px-3 py-1.5 rounded-full border border-amber-500/30">
                <CheckCircle2 className="h-4 w-4 text-amber-400" /> GST Input Credit Invoicing
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold text-slate-900">{products.length}</span> products in{" "}
            <span className="font-semibold text-amber-700">{category?.name}</span>
          </p>

          <div className="flex items-center gap-3">
            <label htmlFor="category-sort" className="text-xs font-medium text-slate-500">
              Sort by:
            </label>
            <select
              id="category-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-700 shadow-sm focus:border-amber-500 focus:outline-none"
            >
              <option value="featured">Featured First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white p-4 border border-slate-200">
                <div className="aspect-square bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 py-8">
            {products.map((product) => (
              <ProductCard key={product._id || product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 my-8 p-8">
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No Ready-Made Products Listed Yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
              We manufacture custom {category?.name} in any dimension and flute specification. Request an instant engineering quote.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                to="/custom-packaging"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-amber-700 transition"
              >
                Custom Box Calculator <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                All Products
              </Link>
            </div>
          </div>
        )}
      </div>

      <CTASection />
    </div>
  );
}
