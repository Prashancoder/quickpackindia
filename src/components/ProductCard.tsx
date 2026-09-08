import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow duration-200 hover:shadow-menu">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="block aspect-4/3 overflow-hidden bg-surface"
      >
        <img
          src={product.image}
          alt={`${product.name} manufactured by QuickPack India`}
          loading="lazy"
          width={1024}
          height={768}
          className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 border-t border-border p-4">
        <h3 className="text-base leading-snug font-semibold text-foreground">
          <Link to="/products/$slug" params={{ slug: product.slug }}>
            {product.name}
          </Link>
        </h3>
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-foreground"
        >
          View More
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
