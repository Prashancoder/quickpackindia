import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  Truck,
  MapPin,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Tag,
  CreditCard,
  Plus,
  AlertCircle,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Secure Checkout | QuickPack India" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutPage,
});

// Load Cashfree Payments SDK helper
function loadCashfreeScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    if ((window as any).Cashfree) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function CheckoutPage() {
  const navigate = useNavigate();
  const {
    items,
    getSubtotal,
    getDiscount,
    getTax,
    getGrandTotal,
    appliedCoupon,
    clearCart,
  } = useCartStore();

  const { user, isAuthenticated, openLoginModal } = useAuthStore();

  // Selected address state
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState<boolean>(false);

  // Address Form
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    houseFlat: "",
    street: "",
    area: "",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110020",
    landmark: "",
  });

  // Billing address toggle
  const [differentBilling, setDifferentBilling] = useState(false);
  const [billingForm, setBillingForm] = useState({
    fullName: "",
    phone: "",
    houseFlat: "",
    street: "",
    area: "",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110020",
  });

  // Payment gateway choice (Cashfree primary RBI-authorized gateway)
  const selectedGateway = "CASHFREE";
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [orderNotes, setOrderNotes] = useState("");

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const tax = getTax();
  const grandTotal = getGrandTotal();

  useEffect(() => {
    if (items.length === 0) {
      navigate({ to: "/cart" });
    }
  }, [items, navigate]);

  const activeShippingAddress =
    isAuthenticated && user?.addresses && user.addresses.length > 0 && !showNewAddressForm
      ? user.addresses[selectedAddressIndex] || user.addresses[0]
      : addressForm;

  const handlePayment = async () => {
    // Validate shipping address
    if (!activeShippingAddress?.fullName || !activeShippingAddress?.phone || !activeShippingAddress?.pincode) {
      toast.error("Please provide a complete delivery address with PIN code.");
      return;
    }

    if (activeShippingAddress.pincode.length !== 6) {
      toast.error("PIN code must be exactly 6 digits.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Checkout Session on Backend with Cashfree
      const sessionRes = await api.createCheckoutSession({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        shippingAddress: activeShippingAddress,
        billingAddress: differentBilling ? billingForm : activeShippingAddress,
        couponCode: appliedCoupon?.code,
        notes: orderNotes,
        gateway: "CASHFREE",
        returnUrl: `${window.location.origin}/orders/{order_id}`,
      });

      if (!sessionRes.success || !sessionRes.orderId) {
        throw new Error(sessionRes.message || "Failed to initialize checkout session.");
      }

      // ==========================================
      // GATEWAY: CASHFREE PAYMENTS
      // ==========================================
      const isLoaded = await loadCashfreeScript();
      if (!isLoaded || !(window as any).Cashfree) {
        throw new Error("Could not load Cashfree Payments SDK. Please check your internet connection.");
      }

      const cashfree = (window as any).Cashfree({
        mode: sessionRes.payment?.environment === "PRODUCTION" ? "production" : "sandbox",
      });

      const checkoutOptions = {
        paymentSessionId: sessionRes.payment?.paymentSessionId,
        redirectTarget: "_modal",
      };

      await cashfree.checkout(checkoutOptions).then((result: any) => {
        setIsProcessing(false);
        if (result.error) {
          toast.error(result.error.message || "Cashfree payment was cancelled or failed.");
          return;
        }
        if (result.redirect) {
          console.log("Cashfree payment redirecting...");
          return;
        }
        if (result.paymentDetails) {
          // Verify payment on backend
          api
            .verifyPayment({
              orderId: sessionRes.orderId,
              orderNumber: sessionRes.orderNumber,
              gateway: "CASHFREE",
            })
            .then((verifyRes) => {
              if (verifyRes.success) {
                clearCart();
                toast.success("Payment Verified! Order Confirmed.");
                navigate({
                  to: "/orders/$orderId",
                  params: { orderId: sessionRes.orderNumber },
                });
              } else {
                toast.error("Payment pending reconciliation. Order recorded.");
              }
            })
            .catch((err) => {
              toast.error(err.message || "Error verifying Cashfree payment.");
            });
        }
      }).catch((err: any) => {
        setIsProcessing(false);
        toast.error(err.message || "Unable to open Cashfree payment window.");
      });
    } catch (err: any) {
      toast.error(err.message || "Checkout session failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container-page py-10 md:py-14">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border pb-6">
        <Link to="/cart" className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />
          Back to Cart
        </Link>
        <span className="text-muted-foreground">•</span>
        <span className="text-xs font-bold text-primary uppercase tracking-wider">Step 2 of 2</span>
        <h1 className="text-xl font-black md:text-2xl ml-auto">Complete Order</h1>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Left Column: Delivery & Payment Details */}
        <div className="space-y-8">
          {/* 1. SHIPPING ADDRESS */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <MapPin className="size-5 text-primary" />
                <h2 className="text-base font-bold">1. Delivery Address</h2>
              </div>

              {isAuthenticated && user?.addresses && user.addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <Plus className="size-3.5" />
                  {showNewAddressForm ? "Select Saved Address" : "Add New Address"}
                </button>
              )}
            </div>

            {/* Existing Saved Addresses */}
            {isAuthenticated && user?.addresses && user.addresses.length > 0 && !showNewAddressForm ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {user.addresses.map((addr, idx) => (
                  <div
                    key={addr._id || idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    className={`cursor-pointer rounded-xl border p-4 text-xs transition-all ${selectedAddressIndex === idx
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-muted-foreground/40 bg-surface"
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-foreground text-sm">{addr.fullName}</span>
                      {selectedAddressIndex === idx && (
                        <CheckCircle2 className="size-4 text-primary" />
                      )}
                    </div>
                    <p className="text-muted-foreground">{addr.phone}</p>
                    <p className="mt-2 text-foreground">
                      {addr.houseFlat}, {addr.street}, {addr.area}
                    </p>
                    <p className="font-medium text-foreground">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              /* Address Form */
              <div className="mt-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Contact Person / Full Name *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Mobile Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Flat, Factory Unit, Building *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.houseFlat}
                      onChange={(e) => setAddressForm({ ...addressForm, houseFlat: e.target.value })}
                      placeholder="e.g. Plot No. 42 / Unit B-2"
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Street &amp; Industrial Area *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      placeholder="e.g. Okhla Industrial Area Phase 3"
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">City *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">State *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">PIN Code (6 digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      placeholder="110020"
                      className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Order Delivery Notes */}
            <div className="mt-4 pt-4 border-t border-border">
              <label className="text-xs font-semibold text-muted-foreground">Special Dispatch / Gate Delivery Notes</label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Deliver at Gate 2, call security before unloading"
                className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* 2. PAYMENT GATEWAY SELECTION */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <CreditCard className="size-5 text-primary" />
              <h2 className="text-base font-bold">2. Select Payment Method (RBI Approved)</h2>
            </div>

            <div className="mt-4">
              {/* Cashfree Payments Option */}
              <div className="rounded-xl border border-primary bg-primary/5 ring-1 ring-primary p-4.5 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-4 rounded-full border-2 border-primary flex items-center justify-center">
                      <div className="size-2 rounded-full bg-primary" />
                    </div>
                    <span className="font-extrabold text-sm text-foreground">Cashfree Payments</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    RBI Authorized • PCI-DSS Level 1
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                  Fast &amp; secure checkout with UPI (Google Pay, PhonePe, Paytm, BHIM QR), Credit/Debit Cards (Visa, Mastercard, RuPay), NetBanking (50+ Banks) &amp; Wallets.
                </p>
                <div className="mt-3 pl-6 flex flex-wrap items-center gap-2 text-[11px] font-medium">
                  <span className="bg-background border border-border px-2.5 py-1 rounded text-foreground font-semibold shadow-xs">Instant UPI / QR</span>
                  <span className="bg-background border border-border px-2.5 py-1 rounded text-foreground font-semibold shadow-xs">Credit &amp; Debit Cards</span>
                  <span className="bg-background border border-border px-2.5 py-1 rounded text-foreground font-semibold shadow-xs">NetBanking</span>
                  <span className="bg-background border border-border px-2.5 py-1 rounded text-foreground font-semibold shadow-xs">Corporate &amp; Wallets</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Proceed */}
        <div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5 sticky top-24">
            <h2 className="text-lg font-bold text-foreground">Order Summary</h2>

            {/* Items Mini List */}
            <div className="max-h-56 overflow-y-auto divide-y divide-border pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="max-w-[70%]">
                    <p className="font-bold text-foreground truncate">{item.productName}</p>
                    <p className="text-muted-foreground">
                      {item.variantOptions?.topPaper} • Pack of {item.variantOptions?.packQuantity} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-extrabold text-foreground">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 border-t border-border pt-4 text-xs sm:text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">
                  ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Pan-India Shipping</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>

              <div className="flex justify-between text-muted-foreground text-xs">
                <span>GST 18% (Included)</span>
                <span>₹{tax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between border-t border-border pt-3 text-lg font-black text-foreground">
                <span>Total Payable</span>
                <span className="text-primary">
                  ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePayment}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-sm font-black text-primary-foreground shadow-lg transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              <Lock className="size-4" />
              {isProcessing
                ? "Connecting to Cashfree..."
                : `Pay ₹${grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })} via Cashfree`}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>100% Encrypted &amp; Gateway-Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
