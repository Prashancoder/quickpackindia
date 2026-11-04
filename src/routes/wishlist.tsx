import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist | QuickPack India" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { items, toggleWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product._id,
      productName: product.name,
      slug: product.slug,
      image: product.thumbnail || "/assets/corrugated-boxes.jpg",
      price: product.basePrice || product.minPrice || 892.1,
      quantity: 1,
      variantOptions: {
        topPaper: "Brown",
        packQuantity: 100,
      },
    });
    toast.success(`Added ${product.name} to cart!`);
  };

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-surface text-muted-foreground">
          <Heart className="size-10" />
        </div>
        <h1 className="mt-5 text-2xl font-black md:text-3xl">Your Wishlist is Empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Save your favourite corrugated boxes and mailers to purchase anytime.
        </p>
        <Link
          to="/products"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:opacity-95"
        >
          <ArrowLeft className="size-4" />
          Explore Packaging Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold tracking-wider text-primary uppercase">Saved Items</span>
          <h1 className="mt-1 text-2xl font-black md:text-3xl">My Wishlist ({items.length})</h1>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          Continue Shopping <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((product) => (
          <div
            key={product._id}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:shadow-menu"
          >
            <div className="relative aspect-4/3 bg-surface p-4 flex items-center justify-center">
              <img
                src={product.thumbnail || "/assets/corrugated-boxes.jpg"}
                alt={product.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/corrugated-boxes.jpg";
                }}
                className="h-full w-full object-contain"
              />
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full bg-card/90 text-red-500 hover:scale-110 shadow-xs"
                title="Remove from wishlist"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <h3 className="text-sm font-bold text-foreground hover:text-primary">
                  <Link to="/products/$slug" params={{ slug: product.slug }}>
                    {product.name}
                  </Link>
                </h3>
                <p className="mt-2 text-sm font-extrabold text-primary">
                  Starts From ₹{(product.minPrice || product.basePrice || 790).toFixed(2)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90"
                >
                  <ShoppingBag className="size-3.5" />
                  Add to Cart
                </button>
                <Link
                  to="/products/$slug"
                  params={{ slug: product.slug }}
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent"
                >
                  View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
