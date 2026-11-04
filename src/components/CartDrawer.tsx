import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotalItems,
    getDiscount,
    getGrandTotal,
  } = useCartStore();

  if (!isDrawerOpen) return null;

  const totalItems = getTotalItems();
  const subtotal = getSubtotal();
  const discount = getDiscount();
  const grandTotal = getGrandTotal();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside
          aria-label="Shopping cart"
          className="flex w-screen max-w-md flex-col bg-background shadow-2xl transition-transform"
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="size-5 text-primary" />
              <h2 className="text-lg font-bold">Your Cart ({totalItems})</h2>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Close cart"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Promotional notification */}
          <div className="bg-primary/10 px-5 py-2.5 text-xs font-semibold text-primary flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Truck className="size-4 shrink-0" />
              Free Pan-India Delivery on Factory Orders
            </span>
            <span>GST Included</span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-accent text-muted-foreground">
                  <ShoppingBag className="size-8" />
                </div>
                <h3 className="mt-4 text-base font-bold">Your cart is empty</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Explore our packaging range and add boxes to your cart.
                </p>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="mt-6 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-4">
                    <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-surface p-1">
                      <img
                        src={item.image || "/assets/corrugated-boxes.jpg"}
                        alt={item.productName}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold leading-tight">
                            <Link
                              to="/products/$slug"
                              params={{ slug: item.slug }}
                              onClick={closeDrawer}
                              className="hover:text-primary"
                            >
                              {item.productName}
                            </Link>
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-muted-foreground hover:text-destructive p-1"
                            title="Remove"
                            aria-label="Remove item"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>

                        {/* Variant Chips */}
                        {item.variantOptions && (
                          <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
                            {item.variantOptions.topPaper && (
                              <span className="rounded bg-accent px-2 py-0.5 font-medium text-foreground">
                                {item.variantOptions.topPaper}
                              </span>
                            )}
                            {item.variantOptions.packQuantity && (
                              <span className="rounded bg-accent px-2 py-0.5 font-medium text-foreground">
                                Pack of {item.variantOptions.packQuantity}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        {/* Quantity Stepper */}
                        <div className="flex items-center rounded-md border border-border bg-card">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 text-muted-foreground hover:text-foreground"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 text-muted-foreground hover:text-foreground"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-extrabold text-foreground">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                          {item.unitPricePerBox && (
                            <p className="text-[11px] text-muted-foreground">
                              ₹{item.unitPricePerBox.toFixed(2)} / pc
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Drawer Footer */}
          {items.length > 0 && (
            <div className="border-t border-border bg-surface/50 p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">
                    ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-extrabold text-foreground">
                  <span>Total (GST Included)</span>
                  <span className="text-primary">
                    ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <Link
                  to="/checkout"
                  onClick={closeDrawer}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground shadow-md transition-opacity hover:opacity-95"
                >
                  Proceed to Checkout
                  <ArrowRight className="size-4" />
                </Link>

                <Link
                  to="/cart"
                  onClick={closeDrawer}
                  className="flex w-full items-center justify-center rounded-lg border border-border bg-card py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
                >
                  View Full Cart
                </Link>
              </div>

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>100% Secure Checkout with Cashfree</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
