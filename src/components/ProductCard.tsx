import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Star, Eye, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { QuickAddModal } from "./QuickAddModal";

export interface ProductCardProps {
  product: {
    _id?: string;
    id?: string;
    name: string;
    slug: string;
    thumbnail?: string;
    image?: string;
    shortDescription?: string;
    description?: string;
    approximatePrice?: string;
    priceUnit?: string;
    minimumOrderQuantity?: string;
    basePrice?: number;
    compareAtPrice?: number;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    reviewCount?: number;
    size?: string;
    tags?: string[];
    variants?: any[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  const productId = (product._id || product.id || product.slug) as string;
  const isWishlisted = isInWishlist(productId);

  const imgSrc = product.thumbnail || product.image || "/assets/corrugated-boxes.jpg";
  const rating = product.rating || 5;
  const reviewCount = product.reviewCount || 0;

  const minPrice = product.minPrice || product.basePrice || 0;
  const maxPrice = product.maxPrice || product.basePrice || 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      _id: productId,
      name: product.name,
      slug: product.slug,
      thumbnail: imgSrc,
      minPrice,
      maxPrice,
      basePrice: minPrice,
    });
  };

  const formattedProduct = {
    _id: productId,
    name: product.name,
    slug: product.slug,
    thumbnail: imgSrc,
    basePrice: minPrice,
    ...(product.compareAtPrice !== undefined ? { compareAtPrice: product.compareAtPrice } : {}),
    minPrice,
    maxPrice,
    ...(product.variants !== undefined ? { variants: product.variants } : {}),
  };

  return (
    <>
      <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card hover:border-primary/50">
        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className={`absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full border border-border/60 bg-white/90 shadow-xs backdrop-blur-xs transition-transform hover:scale-110 ${
            isWishlisted ? "text-red-500 fill-red-500" : "text-foreground hover:text-red-500"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`size-4.5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
        </button>

        {/* Product Image */}
        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="relative block aspect-4/3 overflow-hidden bg-surface/60 p-4"
        >
          <img
            src={imgSrc}
            alt={`${product.name} manufactured by QuickPack India`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
            }}
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-108"
          />
        </Link>

        {/* Card Body */}
        <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
          <div>
            {/* Rating */}
            <div className="flex items-center gap-1.5 text-xs text-amber-500">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`size-3.5 ${
                      i < Math.floor(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
              {reviewCount > 0 && (
                <span className="text-[11px] text-muted-foreground">({reviewCount})</span>
              )}
            </div>

            {/* Product Title */}
            <h3 className="mt-2 text-sm sm:text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
              <Link to="/products/$slug" params={{ slug: product.slug }}>
                {product.name}
              </Link>
            </h3>

            {/* Short Description */}
            <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {product.shortDescription || product.description?.slice(0, 110) || "High-grade industrial packaging manufactured to custom size & ply specifications."}
            </p>
          </div>

          <div className="mt-4 border-t border-border/60 pt-3">
            {/* Price / MOQ display */}
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {product.approximatePrice ? "Approx. Price" : "Factory Price"}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-primary">
                  {product.approximatePrice
                    ? `${product.approximatePrice} ${product.priceUnit ? `/ ${product.priceUnit}` : ""}`
                    : minPrice > 0
                    ? `₹${minPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "Request Quote"}
                </span>
              </div>

              {product.minimumOrderQuantity && (
                <div className="text-right">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    MOQ
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {product.minimumOrderQuantity}
                  </span>
                </div>
              )}
            </div>

            {/* View Details Button */}
            <Link
              to="/products/$slug"
              params={{ slug: product.slug }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:opacity-95 hover:shadow-sm"
            >
              <span>View Details</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </article>

      {/* Quick Add Modal */}
      {product.variants && product.variants.length > 0 && (
        <QuickAddModal
          product={formattedProduct}
          isOpen={quickAddOpen}
          onClose={() => setQuickAddOpen(false)}
        />
      )}
    </>
  );
}
