import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Factory, MapPin, Truck, Sparkles, BookOpen, Star } from "lucide-react";
import { CTASection } from "@/components/CTASection";
import { ProductBanner } from "@/components/ProductBanner";
import { ProductCard } from "@/components/ProductCard";
import factoryImg from "@/assets/factory.jpg";
import { api } from "@/lib/api";
import { categories as staticCategories } from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "QuickPack India | Corrugated Box & Packaging Manufacturer | Factory Direct",
      },
      {
        name: "description",
        content:
          "Buy 3-ply & 5-ply corrugated boxes, premium mailer boxes, mono cartons and paper bags directly from manufacturer. Pan-India dispatch, GST inclusive, factory pricing since 1991.",
      },
      {
        property: "og:title",
        content: "QuickPack India | Packaging Manufacturer Since 1991",
      },
      {
        property: "og:description",
        content:
          "Corrugated boxes, mailer boxes, mono cartons and paper bags for e-commerce, FMCG, pharma, electronics and exports.",
      },
      {
        property: "og:url",
        content: "/",
      },
      {
        property: "og:type",
        content: "website",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const trust = [
  {
    icon: Factory,
    title: "35+ Years",
    text: "Packaging manufacturing experience since 1991",
  },
  {
    icon: MapPin,
    title: "Pan India",
    text: "Serving businesses and D2C brands across India",
  },
  {
    icon: Truck,
    title: "Express 48-Hour Dispatch",
    text: "Quick turnaround on standard and bulk consignments",
  },
  {
    icon: BadgeCheck,
    title: "Reliable Quality",
    text: "High burst factor kraft paperboard with 100% recyclability",
  },
];

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>(staticCategories);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch dynamic products & blogs from API
    Promise.all([
      api.getProducts({ limit: 8, homepage: "true" }),
      api.getCategories(),
      api.getBlogs({ limit: 3 }),
    ])
      .then(([prodRes, catRes, blogRes]) => {
        if (prodRes.success && prodRes.products?.length > 0) {
          setFeaturedProducts(prodRes.products);
        }
        if (catRes.success && catRes.categories?.length > 0) {
          setCategories(catRes.categories);
        }
        if (blogRes.success && blogRes.blogs?.length > 0) {
          setBlogs(blogRes.blogs);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch homepage data from API:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <ProductBanner />

      {/* ==================== PART 1: OUR PRODUCTS SECTION ==================== */}
      <section className="py-14 sm:py-18 bg-background border-b border-border">
        <div className="container-page">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary tracking-wide uppercase">
              <Sparkles className="size-3.5" /> Factory Direct Manufacturer
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl md:text-4xl">
              Our Products
            </h2>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground font-normal max-w-3xl mx-auto">
              We are one of the leading manufacturers and suppliers of high-quality corrugated boxes, printed LED packaging boxes, pharmaceutical packaging boxes, cosmetic packaging boxes, tea packaging boxes, oil packaging boxes, agarbatti packaging boxes, automobile parts packaging boxes, mono cartons, stickers, and customized packaging solutions.
            </p>
          </div>

          {/* Product Grid: Desktop 4 columns, Tablet 2 columns, Mobile 1-2 columns */}
          <div className="mt-10 sm:mt-12">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-4">
                    <div className="aspect-square w-full rounded-xl bg-surface" />
                    <div className="mt-4 h-4 w-3/4 rounded bg-surface mx-auto" />
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.slice(0, 8).map((product) => (
                  <Link
                    key={product._id || product.slug}
                    to="/products/$slug"
                    params={{ slug: product.slug }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:border-primary/50"
                  >
                    <div className="aspect-square overflow-hidden bg-surface/60 p-4 flex items-center justify-center">
                      <img
                        src={product.thumbnail || product.images?.[0]?.url || "/assets/corrugated-boxes.jpg"}
                        alt={product.name}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
                        }}
                        className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-108"
                      />
                    </div>
                    <div className="p-4 text-center border-t border-border flex flex-1 flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground transition-colors group-hover:text-primary line-clamp-2">
                          {product.name}
                        </h3>
                        {product.approximatePrice && (
                          <p className="mt-1.5 text-xs font-semibold text-primary">
                            {product.approximatePrice} {product.priceUnit ? `/ ${product.priceUnit}` : ""}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-center gap-1 text-[11px] font-bold text-muted-foreground group-hover:text-primary transition-colors">
                        <span>View Details</span>
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <p className="text-sm text-muted-foreground">Products are being updated. Please check back shortly.</p>
              </div>
            )}
          </div>

          {/* Centered View All Products Button */}
          <div className="mt-10 sm:mt-12 text-center">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-all duration-200 hover:opacity-95 hover:shadow-lg"
            >
              <span>View All Products</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Highlights Bar */}
      <section className="border-b border-border bg-surface/50 py-6">
        <div className="container-page grid grid-cols-2 gap-4 md:grid-cols-4">
          {trust.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground sm:text-sm">{title}</h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>




      {/* Categories Showcase */}
      <section className="border-y border-border bg-surface/40 py-16">
        <div className="container-page">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold md:text-3xl">Explore Product Categories</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              High quality packaging manufactured to custom plies, sizes, and print specs.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug || cat.id}
                to="/products"
                search={{ category: cat.slug || cat.id }}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-menu"
              >
                <div className="aspect-4/3 bg-surface p-4 overflow-hidden flex items-center justify-center">
                  <img
                    src={cat.image || "/assets/corrugated-boxes.jpg"}
                    alt={cat.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
                    }}
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 border-t border-border flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {cat.description}
                    </p>
                  </div>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary">
                    Shop Now <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="container-page py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="text-xs font-bold tracking-wider text-primary uppercase">
              Established 1991
            </span>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">About QuickPack India</h2>

            <p className="mt-2 text-lg font-medium text-primary">
              Crafting reliable packaging for India&apos;s growing enterprises.
            </p>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              QuickPack India is a packaging manufacturer delivering high-grade corrugated boxes,
              flip-lid mailer boxes, mono cartons, and eco-friendly paper bags.
            </p>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <strong className="font-semibold text-foreground">
                QuickPack India is the brand name of Krishna Traders
              </strong>
              , our registered business entity with GST registration under Krishna Traders.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90"
              >
                Read Our Story
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-accent"
              >
                Contact Factory Team
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border shadow-card">
            <img
              src={factoryImg}
              alt="QuickPack India Manufacturing Unit"
              loading="lazy"
              className="w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Packaging Guides & Latest Blogs */}
      {blogs.length > 0 && (
        <section className="border-t border-border bg-surface/30 py-16">
          <div className="container-page">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <span className="flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-primary uppercase">
                  <BookOpen className="size-3.5" />
                  Educational Guides
                </span>
                <h2 className="mt-1 text-2xl font-extrabold md:text-3xl">Packaging Insights</h2>
              </div>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
              >
                View All Articles <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((b) => (
                <article
                  key={b._id || b.slug}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-menu"
                >
                  <Link
                    to="/blog/$slug"
                    params={{ slug: b.slug }}
                    className="aspect-16/9 overflow-hidden bg-surface"
                  >
                    <img
                      src={b.featuredImage || "/assets/corrugated-boxes.jpg"}
                      alt={b.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                        {b.category?.name || "Packaging Guide"}
                      </span>
                      <h3 className="mt-2 text-base font-bold leading-snug">
                        <Link
                          to="/blog/$slug"
                          params={{ slug: b.slug }}
                          className="hover:text-primary transition-colors"
                        >
                          {b.title}
                        </Link>
                      </h3>
                      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                        {b.excerpt}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{b.readingTime || 5} min read</span>
                      <Link
                        to="/blog/$slug"
                        params={{ slug: b.slug }}
                        className="font-bold text-primary hover:underline"
                      >
                        Read Guide →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTASection
        title="Need Custom Dimensions or Bulk Quotes?"
        text="Tell us your product dimensions, ply strength, and print artwork. Our engineering team provides instant factory pricing."
      />
    </>
  );
}
