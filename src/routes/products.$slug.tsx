import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { getCategory, getProductBySlug, productsByCategory } from "@/data/products";

export const Route = createFileRoute("/products/$slug")({
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product not found | QuickPack India" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} Manufacturer & Supplier | QuickPack India`;
    return {
      meta: [
        { title },
        { name: "description", content: product.description.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: product.description.slice(0, 155) },
        { property: "og:url", content: `/products/${product.slug}` },
        { property: "og:type", content: "product" },
      ],
      links: [{ rel: "canonical", href: `/products/${product.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            category: getCategory(product.category).name,
            brand: { "@type": "Brand", name: "QuickPack India" },
          }),
        },
      ],
    };
  },
  component: ProductDetail,
  notFoundComponent: ProductNotFound,
});

function ProductNotFound() {
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <p className="mt-2 text-muted-foreground">
        This product may have been renamed or removed.
      </p>
      <Link
        to="/products"
        className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Back to all products
      </Link>
    </div>
  );
}

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const category = getCategory(product.category);
  const related = productsByCategory(product.category)
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  return (
    <div className="container-page py-10 md:py-14">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/products" className="hover:text-primary">
              Products
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/products" search={{ category: category.id }} className="hover:text-primary">
              {category.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground">{product.name}</li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <img
            src={product.image}
            alt={`${product.name} — packaging product by QuickPack India`}
            width={1024}
            height={768}
            className="aspect-4/3 w-full object-contain p-6"
          />
        </div>

        <div>
          <p className="text-xs font-bold tracking-wider text-primary uppercase">
            {category.name}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold md:text-4xl">{product.name}</h1>
          <p className="mt-4 text-muted-foreground">{product.description}</p>

          {product.size && (
            <dl className="mt-6 rounded-lg border border-border bg-card p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="font-semibold">Size</dt>
                <dd className="text-muted-foreground">{product.size}</dd>
              </div>
            </dl>
          )}

          <ul className="mt-6 space-y-2 text-sm">
            {[
              "Manufactured to your required dimensions",
              "Bulk and repeat order supply Pan India",
              "Custom branding and printing available on request",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Get a Quote
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              All Products
            </Link>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-bold md:text-2xl">More in {category.name}</h2>
            <Link
              to="/products"
              search={{ category: category.id }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              View all
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
