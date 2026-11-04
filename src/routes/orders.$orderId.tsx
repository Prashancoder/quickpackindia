import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  ArrowRight,
  ShoppingBag,
  Download,
} from "lucide-react";
import { api } from "@/lib/api";

export const Route = createFileRoute("/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Confirmed | QuickPack India" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OrderSuccessPage,
});

function OrderSuccessPage() {
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .getOrderById(orderId)
      .then((res) => {
        if (res.success && res.order) {
          setOrder(res.order);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch order:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [orderId]);

  const estimatedDelivery = order?.estimatedDeliveryDate
    ? new Date(order.estimatedDeliveryDate).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  return (
    <div className="container-page py-12 md:py-18 max-w-4xl">
      {/* Success Banner */}
      <div className="text-center">
        <div className="mx-auto flex size-18 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="size-10" />
        </div>
        <span className="mt-4 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600">
          PAYMENT VERIFIED &amp; CONFIRMED
        </span>
        <h1 className="mt-2 text-2xl font-black md:text-4xl text-foreground">
          Thank You! Your Order is Placed.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Order Reference: <span className="font-mono font-bold text-foreground">#{order?.orderNumber || orderId}</span>
        </p>
      </div>

      {/* Order Details Card */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        {/* Progress Bar */}
        <div className="border-b border-border bg-surface/50 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Truck className="size-6 text-primary" />
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Estimated Arrival</p>
                <p className="text-base font-extrabold text-foreground">{estimatedDelivery}</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs">
              ✓ Status: Confirmed &amp; Processing
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Items Summary */}
          <div>
            <h2 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-4">
              Ordered Items
            </h2>
            <div className="divide-y divide-border">
              {order?.items?.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface p-1">
                      <img
                        src={item.image || "/assets/corrugated-boxes.jpg"}
                        alt={item.productName}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{item.productName}</h4>
                      {item.variantOptions && (
                        <p className="text-xs text-muted-foreground">
                          {item.variantOptions.topPaper} • Pack of {item.variantOptions.packQuantity} × {item.quantity}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-extrabold text-sm text-foreground">
                    ₹{item.subtotal?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || (item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address & Payment Summary Grid */}
          <div className="grid gap-6 sm:grid-cols-2 pt-6 border-t border-border">
            <div>
              <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-2">
                Shipping Destination
              </h3>
              {order?.shippingAddress ? (
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-bold text-foreground">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>
                    {order.shippingAddress.houseFlat}, {order.shippingAddress.street}
                  </p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Standard Factory Dispatch Address</p>
              )}
            </div>

            <div>
              <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-2">
                Payment Breakdown
              </h3>
              <div className="text-xs space-y-1.5 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">
                    ₹{order?.subtotal?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "0.00"}
                  </span>
                </div>
                {order?.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount</span>
                    <span>-₹{order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>GST 18% (Included)</span>
                  <span>₹{order?.tax?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-sm font-black text-foreground">
                  <span>Total Paid</span>
                  <span className="text-primary">
                    ₹{order?.totalAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="border-t border-border bg-surface/50 p-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs font-bold text-primary-foreground shadow-md hover:opacity-95"
          >
            <ShoppingBag className="size-4" />
            Continue Shopping
          </Link>

          <Link
            to="/account"
            search={{ tab: "orders" }}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-xs font-semibold hover:bg-accent"
          >
            View My Order History
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
