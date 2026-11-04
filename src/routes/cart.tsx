import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Heart,
  Tag,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Shopping Cart | QuickPack India" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getDiscount,
    getTax,
    getGrandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);

  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const tax = getTax();
  const grandTotal = getGrandTotal();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    const res = await applyCoupon(couponInput.trim());
    setCouponLoading(false);

    if (res.success) {
      toast.success(res.message);
      setCouponInput("");
    } else {
      toast.error(res.message);
    }
  };

  const handleMoveToWishlist = (item: any) => {
    toggleWishlist({
      _id: item.productId,
      name: item.productName,
      slug: item.slug,
      thumbnail: item.image,
      minPrice: item.price,
      maxPrice: item.price,
      basePrice: item.price,
    });
    removeItem(item.id);
    toast.success("Moved item to wishlist");
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-surface text-muted-foreground">
          <ShoppingBag className="size-10" />
        </div>
        <h1 className="mt-5 text-2xl font-black md:text-3xl">Your Shopping Cart is Empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You have no packaging items in your cart yet. Explore our boxes and mailers!
        </p>
        <Link
          to="/products"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:opacity-95"
        >
          <ArrowLeft className="size-4" />
          Explore Packaging Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold tracking-wider text-primary uppercase">Order Review</span>
          <h1 className="mt-1 text-2xl font-black md:text-3xl">Shopping Cart ({items.length} items)</h1>
        </div>
        <Link
          to="/products"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Continue Shopping
        </Link>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
        {/* Left: Items Table */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <div className="divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                  <div className="size-24 shrink-0 overflow-hidden rounded-xl border border-border bg-surface p-2">
                    <img
                      src={item.image || "/assets/corrugated-boxes.jpg"}
                      alt={item.productName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
                      }}
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <h3 className="text-base font-bold text-foreground">
                      <Link to="/products/$slug" params={{ slug: item.slug }} className="hover:text-primary">
                        {item.productName}
                      </Link>
                    </h3>

                    {item.variantOptions && (
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-0.5">
                        {item.variantOptions.topPaper && (
                          <span className="rounded bg-accent px-2 py-0.5 font-medium text-foreground">
                            Top Paper: {item.variantOptions.topPaper}
                          </span>
                        )}
                        {item.variantOptions.packQuantity && (
                          <span className="rounded bg-accent px-2 py-0.5 font-medium text-foreground">
                            Pack of {item.variantOptions.packQuantity} Pcs
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground pt-1">
                      ₹{item.price.toFixed(2)} / pack
                      {item.unitPricePerBox && ` (₹${item.unitPricePerBox.toFixed(2)} / box)`}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center rounded-lg border border-border bg-surface">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground font-bold"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground font-bold"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-24">
                      <p className="text-base font-black text-foreground">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleMoveToWishlist(item)}
                        className="rounded-lg p-2 text-muted-foreground hover:text-red-500 hover:bg-accent"
                        title="Move to Wishlist"
                        aria-label="Move to Wishlist"
                      >
                        <Heart className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-accent"
                        title="Remove"
                        aria-label="Remove item"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary Card */}
        <div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
            <h2 className="text-lg font-bold text-foreground">Order Summary</h2>

            {/* Coupon Code Input */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Promotional Coupon
              </label>
              {appliedCoupon ? (
                <div className="mt-2 flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="size-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        {appliedCoupon.code}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        {appliedCoupon.discountType === "PERCENT"
                          ? `${appliedCoupon.discountValue}% discount applied`
                          : `₹${appliedCoupon.discountValue} flat discount`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs font-bold text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon (e.g. WELCOME10)"
                    className="h-10 flex-1 rounded-lg border border-border bg-surface px-3 text-xs font-semibold uppercase outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading}
                    className="rounded-lg bg-neutral-900 px-4 text-xs font-bold text-white hover:bg-neutral-800 disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-foreground">
                  ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Truck className="size-4 text-emerald-600" />
                  Doorstep Delivery
                </span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>

              <div className="flex justify-between text-muted-foreground text-xs">
                <span>Estimated GST Included (18%)</span>
                <span>₹{tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between border-t border-border pt-3 text-lg font-black text-foreground">
                <span>Grand Total</span>
                <span className="text-primary">
                  ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate({ to: "/checkout" })}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-95"
            >
              Proceed to Checkout
              <ArrowRight className="size-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>Cashfree 256-Bit SSL Encrypted Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
