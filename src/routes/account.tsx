import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  User as UserIcon,
  Package,
  MapPin,
  Lock,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Building,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";

export const Route = createFileRoute("/account")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({
    meta: [
      { title: "My Account | QuickPack India" },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { tab: queryTab } = Route.useSearch();
  const { user, isAuthenticated, openLoginModal, logout, updateProfile, addAddress, deleteAddress } =
    useAuthStore();

  const [activeTab, setActiveTab] = useState<string>(queryTab || "profile");
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile Edit State
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [companyName, setCompanyName] = useState(user?.businessProfile?.companyName || "");
  const [gstin, setGstin] = useState(user?.businessProfile?.gstin || "");
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Edit State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  // New Address State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    houseFlat: "",
    street: "",
    area: "",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110020",
    landmark: "",
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
      if (user.businessProfile?.companyName) setCompanyName(user.businessProfile.companyName);
      if (user.businessProfile?.gstin) setGstin(user.businessProfile.gstin);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === "orders" && isAuthenticated) {
      setOrdersLoading(true);
      api
        .getMyOrders()
        .then((res) => {
          if (res.success && res.orders) {
            setOrders(res.orders);
          }
        })
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [activeTab, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="container-page py-24 text-center">
        <div className="mx-auto flex size-18 items-center justify-center rounded-full bg-surface text-muted-foreground">
          <UserIcon className="size-10" />
        </div>
        <h1 className="mt-5 text-2xl font-black md:text-3xl">Sign In to Your Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Access your packaging orders, saved factory addresses, and account details.
        </p>
        <button
          type="button"
          onClick={openLoginModal}
          className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md hover:opacity-95"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      await updateProfile({ name, phone });
      if (companyName || gstin) {
        await api.updateBusinessProfile({ companyName, gstin });
      }
      toast.success("Profile & Business details updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in current and new password");
      return;
    }
    setPasswordSaving(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddress(newAddress);
      toast.success("Address added successfully!");
      setShowAddressModal(false);
      setNewAddress({
        fullName: "",
        phone: "",
        houseFlat: "",
        street: "",
        area: "",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110020",
        landmark: "",
        isDefault: false,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to add address.");
    }
  };

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-primary uppercase">User Hub</span>
          <h1 className="mt-1 text-2xl font-black md:text-3xl">My Account</h1>
          <p className="text-xs text-muted-foreground">Logged in as {user?.email}</p>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/10"
        >
          <LogOut className="size-4" />
          Sign Out
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Navigation Sidebar */}
        <aside className="rounded-2xl border border-border bg-card p-3 shadow-card self-start">
          <nav className="space-y-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "profile"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <UserIcon className="size-4" />
              Profile Details
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "orders"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <Package className="size-4" />
              My Orders
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("addresses")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "addresses"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <MapPin className="size-4" />
              Saved Addresses
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors ${
                activeTab === "password"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <Lock className="size-4" />
              Security &amp; Password
            </button>

            <div className="pt-2">
              <Link
                to="/account/business"
                className="flex w-full items-center justify-between rounded-xl p-3 bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 transition-colors"
              >
                <div className="flex items-center gap-2 text-xs font-bold">
                  <Building className="size-4 text-amber-700" />
                  B2B Portal & Orders
                </div>
                <ChevronRight className="size-3.5 text-amber-700" />
              </Link>
            </div>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card">
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <div>
              <h2 className="text-lg font-bold text-foreground">Personal & Business Information</h2>
              <p className="text-xs text-muted-foreground">Manage your contact details, billing company, and GSTIN for tax invoices.</p>

              <form onSubmit={handleProfileSave} className="mt-6 max-w-lg space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Email Address (Read only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ""}
                    className="mt-1 h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-xs font-semibold text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Mobile Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-2 border-t border-border">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Corporate & Tax Billing Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">Company / Registered Firm Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Logistics Pvt Ltd"
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">GSTIN (for 18% Input Tax Credit)</label>
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="e.g. 07AAACS1429B1ZB"
                        className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs font-semibold uppercase outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90 disabled:opacity-50"
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: MY ORDERS */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-lg font-bold text-foreground">Order History</h2>
              <p className="text-xs text-muted-foreground">Track packaging shipments and view past receipts.</p>

              <div className="mt-6">
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-28 rounded-xl bg-surface animate-pulse" />
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="divide-y divide-border">
                    {orders.map((ord) => (
                      <div key={ord._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-foreground">
                              #{ord.orderNumber}
                            </span>
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                ord.paymentStatus === "PAID"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-amber-500/10 text-amber-600"
                              }`}
                            >
                              {ord.paymentStatus}
                            </span>
                            <span className="rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-foreground">
                              {ord.orderStatus}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Placed on {new Date(ord.createdAt).toLocaleDateString()} • {ord.items?.length || 0} item(s)
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-base font-black text-foreground">
                            ₹{ord.totalAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </span>
                          <Link
                            to="/orders/$orderId"
                            params={{ orderId: ord.orderNumber }}
                            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent"
                          >
                            Details <ExternalLink className="size-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground text-xs">
                    No orders placed yet. Explore our packaging catalogue to place your first order.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: SAVED ADDRESSES */}
          {activeTab === "addresses" && (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Delivery Addresses</h2>
                  <p className="text-xs text-muted-foreground">Manage addresses for fast 1-click checkout.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90"
                >
                  <Plus className="size-3.5" />
                  Add Address
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {user?.addresses?.map((addr, idx) => (
                  <div key={addr._id || idx} className="rounded-xl border border-border bg-surface p-4 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{addr.phone}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {addr.houseFlat}, {addr.street}, {addr.area}, {addr.city}, {addr.state} - {addr.pincode}
                    </p>

                    <button
                      type="button"
                      onClick={() => addr._id && deleteAddress(addr._id)}
                      className="mt-3 text-xs font-bold text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Address Form Modal */}
              {showAddressModal && (
                <form onSubmit={handleAddAddress} className="mt-6 rounded-xl border border-border bg-surface/50 p-5 space-y-4">
                  <h3 className="text-sm font-bold">New Address Details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="h-9 rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                    <input
                      type="tel"
                      required
                      placeholder="Mobile Phone"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="h-9 rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      required
                      placeholder="House / Flat / Building"
                      value={newAddress.houseFlat}
                      onChange={(e) => setNewAddress({ ...newAddress, houseFlat: e.target.value })}
                      className="h-9 rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Street / Area"
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="h-9 rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="h-9 rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="h-9 rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="PIN Code"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="h-9 rounded-lg border border-border bg-card px-3 text-xs outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(false)}
                      className="rounded-lg border border-border px-4 py-2 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: PASSWORD */}
          {activeTab === "password" && (
            <div>
              <h2 className="text-lg font-bold text-foreground">Change Password</h2>
              <p className="text-xs text-muted-foreground">Keep your account secure with a strong password.</p>

              <form onSubmit={handlePasswordChange} className="mt-6 max-w-md space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">New Password (min 6 characters)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="rounded-lg bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:opacity-90 disabled:opacity-50"
                >
                  {passwordSaving ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
