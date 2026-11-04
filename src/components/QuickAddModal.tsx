import { useState, useMemo } from "react";
import { X, Check, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useCartStore } from "@/store/useCartStore";

export interface QuickAddProduct {
  _id: string;
  name: string;
  slug: string;
  thumbnail: string;
  basePrice: number;
  compareAtPrice?: number;
  minPrice: number;
  maxPrice: number;
  variants?: Array<{
    _id: string;
    sku: string;
    options: {
      topPaper?: string;
      packQuantity?: number;
      size?: string;
      [key: string]: any;
    };
    price: number;
    compareAtPrice?: number;
    unitPricePerBox?: number;
    stock: number;
  }>;
}

interface QuickAddModalProps {
  product: QuickAddProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddModal({ product, isOpen, onClose }: QuickAddModalProps) {
  const addItem = useCartStore((state) => state.addItem);

  const [selectedTopPaper, setSelectedTopPaper] = useState<string>("Brown");
  const [selectedQuantity, setSelectedQuantity] = useState<number>(100);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);

  // Derive unique options from variants
  const availablePapers = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return ["Brown", "White", "Logo Printed"];
    const set = new Set<string>();
    product.variants.forEach((v) => {
      if (v.options.topPaper) set.add(v.options.topPaper);
    });
    return Array.from(set);
  }, [product]);

  const availableQuantities = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return [100, 200, 500, 1000, 3000, 5000];
    const set = new Set<number>();
    product.variants.forEach((v) => {
      if (v.options.packQuantity) set.add(v.options.packQuantity);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [product]);

  // Find currently matching variant
  const activeVariant = useMemo(() => {
    if (!product?.variants) return null;
    return product.variants.find(
      (v) =>
        v.options.topPaper?.toLowerCase() === selectedTopPaper.toLowerCase() &&
        Number(v.options.packQuantity) === Number(selectedQuantity)
    );
  }, [product, selectedTopPaper, selectedQuantity]);

  if (!isOpen || !product) return null;

  const currentPrice = activeVariant ? activeVariant.price : product.basePrice;
  const comparePrice = activeVariant?.compareAtPrice || product.compareAtPrice;
  const unitPrice =
    activeVariant?.unitPricePerBox || (selectedQuantity ? currentPrice / selectedQuantity : null);

  const handleAddToCart = () => {
    addItem({
      productId: product._id,
      variantId: activeVariant?._id,
      productName: product.name,
      slug: product.slug,
      image: product.thumbnail || "/assets/corrugated-boxes.jpg",
      variantOptions: {
        topPaper: selectedTopPaper,
        packQuantity: selectedQuantity,
      },
      price: currentPrice,
      compareAtPrice: comparePrice,
      unitPricePerBox: unitPrice || undefined,
      quantity: orderQuantity,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-border p-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              QUICK SELECT
            </span>
            <h3 className="text-base font-bold text-foreground">Select Variant & Quantity</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-5 sm:p-6">
          {/* Product Header */}
          <div className="flex gap-4">
            <div className="size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-surface p-2">
              <img
                src={product.thumbnail || "/assets/corrugated-boxes.jpg"}
                alt={product.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
                }}
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h4 className="text-base font-bold leading-snug">{product.name}</h4>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-primary">
                  ₹{currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
                {comparePrice && comparePrice > currentPrice && (
                  <span className="text-xs text-muted-foreground line-through">
                    ₹{comparePrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                )}
                {unitPrice && (
                  <span className="text-xs font-medium text-muted-foreground">
                    (₹{unitPrice.toFixed(2)} / pc)
                  </span>
                )}
              </div>
              <span className="mt-1 inline-block text-[11px] font-semibold text-emerald-600">
                ✓ In Stock &amp; GST Included
              </span>
            </div>
          </div>

          {/* 1. TOP PAPER SELECTOR */}
          <div className="mt-6">
            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              1. Top Paper Finish: <span className="font-bold text-foreground">{selectedTopPaper}</span>
            </label>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {availablePapers.map((paper) => {
                const active = selectedTopPaper.toLowerCase() === paper.toLowerCase();
                return (
                  <button
                    key={paper}
                    type="button"
                    onClick={() => setSelectedTopPaper(paper)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-all ${
                      active
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                        : "border-border bg-surface text-foreground hover:border-primary/50"
                    }`}
                  >
                    {active && <Check className="size-3.5" />}
                    {paper}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. PACK QUANTITY SELECTOR */}
          <div className="mt-6">
            <label className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              2. Select Pack Quantity: <span className="font-bold text-foreground">Pack of {selectedQuantity} Pcs</span>
            </label>
            <div className="mt-2.5 grid grid-cols-3 gap-2 sm:grid-cols-3">
              {availableQuantities.map((qty) => {
                const active = Number(selectedQuantity) === Number(qty);
                return (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setSelectedQuantity(qty)}
                    className={`flex flex-col items-center justify-center rounded-lg border p-2.5 text-center transition-all ${
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-card text-foreground hover:bg-accent"
                    }`}
                  >
                    <span className="text-xs font-bold">Pack of {qty}</span>
                    <span className={`text-[10px] ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {qty >= 1000 ? "Bulk Saving" : "Standard"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. ORDER QUANTITY STEPPER */}
          <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-surface p-3">
            <span className="text-sm font-bold text-foreground">Number of Packs:</span>
            <div className="flex items-center rounded-lg border border-border bg-card">
              <button
                type="button"
                onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-1.5 text-sm font-bold text-muted-foreground hover:text-foreground"
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-bold text-foreground">
                {orderQuantity}
              </span>
              <button
                type="button"
                onClick={() => setOrderQuantity((q) => q + 1)}
                className="px-3 py-1.5 text-sm font-bold text-muted-foreground hover:text-foreground"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border bg-surface/50 p-4 sm:px-6">
          <div>
            <span className="text-xs text-muted-foreground">Total Amount</span>
            <p className="text-lg font-extrabold text-foreground">
              ₹{(currentPrice * orderQuantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/products/$slug"
              params={{ slug: product.slug }}
              onClick={onClose}
              className="rounded-lg border border-border px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Full Details
            </Link>

            <button
              type="button"
              onClick={handleAddToCart}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-95"
            >
              <ShoppingBag className="size-4" />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
