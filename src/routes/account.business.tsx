import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Building,
  Box,
  FileText,
  CreditCard,
  FolderDown,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Check,
  Download,
  Calendar,
  Layers,
  Printer,
  Sparkles,
  Phone,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export const Route = createFileRoute("/account/business")({
  head: () => ({
    meta: [
      { title: "B2B Corporate Portal & Manufacturing Orders | QuickPack India" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BusinessPortalPage,
});

function BusinessPortalPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, openLoginModal } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "quotations" | "payments" | "documents">(
    "overview"
  );

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Repeat Order State
  const [reorderModalOrder, setReorderModalOrder] = useState<any>(null);
  const [reorderQty, setReorderQty] = useState<number>(0);
  const [reorderNotes, setReorderNotes] = useState("");
  const [isSubmittingReorder, setIsSubmittingReorder] = useState(false);

  // Design Upload State
  const [uploadModalOrder, setUploadModalOrder] = useState<any>(null);
  const [designFileUrl, setDesignFileUrl] = useState("");
  const [designFileName, setDesignFileName] = useState("");
  const [isUploadingDesign, setIsUploadingDesign] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [meRes, ordRes, quoRes, payRes, docRes] = await Promise.all([
        api.b2b.getMe().catch(() => null),
        api.b2b.getOrders().catch(() => null),
        api.b2b.getQuotations().catch(() => null),
        api.b2b.getPayments().catch(() => null),
        api.b2b.getDocuments().catch(() => null),
      ]);

      if (meRes?.success) setDashboardData(meRes);
      if (ordRes?.success) setOrders(ordRes.orders || []);
      if (quoRes?.success) setQuotations(quoRes.quotations || []);
      if (payRes?.success) setPayments(payRes.payments || []);
      if (docRes?.success) setDocuments(docRes.documents || []);
    } catch (err) {
      console.warn("Failed to load B2B data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    loadData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-4">
          <div className="p-4 bg-amber-50 rounded-2xl w-fit mx-auto text-amber-700">
            <Building className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">B2B Corporate Portal</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please log in with your company account to view custom box production timelines, design proofs, advance payments, and repeat orders.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={openLoginModal}
              className="py-2.5 px-6 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow transition"
            >
              Sign In
            </button>
            <Link
              to="/signup"
              className="py-2.5 px-6 border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs rounded-xl transition"
            >
              Register Business
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle Quotation Accept
  const handleAcceptQuotation = async (id: string) => {
    try {
      const res = await api.b2b.acceptQuotation(id);
      toast.success(res.message || "Quotation accepted!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept quotation.");
    }
  };

  // Handle Repeat Order Submission
  const handleConfirmReorder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reorderModalOrder) return;

    setIsSubmittingReorder(true);
    try {
      const res = await api.b2b.requestReorder(reorderModalOrder._id, {
        quantity: reorderQty,
        notes: reorderNotes,
      });

      toast.success(res.message || "Repeat order enquiry created!");
      setReorderModalOrder(null);
      loadData();
      setActiveTab("quotations");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit repeat order.");
    } finally {
      setIsSubmittingReorder(false);
    }
  };

  // Handle Design Proof Approval
  const handleApproveDesign = async (orderId: string, version: number) => {
    try {
      const res = await api.b2b.approveOrderDesign(orderId, { version });
      toast.success(res.message || `Artwork v${version} approved!`);
      loadData();
      if (selectedOrder) {
        setSelectedOrder(res.order);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to approve design.");
    }
  };

  // Status badge styling
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PRODUCTION":
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">In Production</span>;
      case "APPROVED_FOR_PRODUCTION":
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Approved for Production</span>;
      case "AWAITING_DESIGN_APPROVAL":
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Proof Awaiting Approval</span>;
      case "AWAITING_ADVANCE":
        return <span className="bg-orange-100 text-orange-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Advance Due</span>;
      case "DELIVERED":
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Delivered</span>;
      case "DISPATCHED":
        return <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Dispatched</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-0.5 rounded-full">{status.replace(/_/g, " ")}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header Profile Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-amber-50 rounded-2xl text-amber-700 shrink-0">
              <Building className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">
                  {user?.businessProfile?.companyName || user?.name || "Corporate Packaging Account"}
                </h1>
                {user?.businessProfile?.isVerified && (
                  <span className="flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Verified Client
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Contact: {user?.name} | {user?.email} | {user?.phone || "No phone registered"}
                {user?.businessProfile?.gstin && ` | GSTIN: ${user.businessProfile.gstin}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/custom-packaging"
              className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow transition flex items-center gap-1.5"
            >
              <Box className="h-4 w-4" /> New Custom Box Order
            </Link>
            <a
              href="https://wa.me/919871002637?text=Hi%20QuickPack%20Team%2C%20I%20have%20an%20enquiry%20regarding%20my%20B2B%20manufacturing%20account."
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 border border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600" /> WhatsApp Production Mgr
            </a>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Active Production Orders</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {dashboardData?.summary?.activeOrders ?? orders.length}
            </div>
            <span className="text-[11px] text-amber-700 font-medium">In factory manufacturing line</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Total Orders Placed</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{orders.length}</div>
            <span className="text-[11px] text-slate-500">All-time packaging runs</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Payments Reconciled</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              ₹{(dashboardData?.summary?.totalPaid ?? 0).toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-emerald-700">Verified factory receipts</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-xs text-slate-500 font-medium">Outstanding Balance Due</span>
            <div className="text-2xl font-bold text-amber-700 mt-1">
              ₹{(dashboardData?.summary?.totalOutstandingBalance ?? 0).toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-slate-500">Payable prior to final dispatch</span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
          {[
            { id: "overview", label: "Overview & Active Orders", icon: Box },
            { id: "orders", label: `All Custom Orders (${orders.length})`, icon: Layers },
            { id: "quotations", label: `Quotations (${quotations.length})`, icon: FileText },
            { id: "payments", label: `Payment History & Balance (${payments.length})`, icon: CreditCard },
            { id: "documents", label: `Invoices & Artwork (${documents.length})`, icon: FolderDown },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "bg-amber-600 text-white shadow"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW & ACTIVE ORDERS */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">Current Manufacturing Orders</h3>
                <Link to="/custom-packaging" className="text-xs text-amber-600 hover:underline">
                  + Request New Spec
                </Link>
              </div>

              {orders.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {orders.map((order) => (
                    <div
                      key={order._id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 p-2 rounded-2xl transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-sm text-slate-900">#{order.orderNumber}</span>
                          {renderStatusBadge(order.orderStatus)}
                          {order.isRepeatOrder && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                              Repeat Order
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-700">
                          {order.specifications.quantity.toLocaleString("en-IN")} pcs ×{" "}
                          {order.specifications.productType} ({order.specifications.dimensions.length}×
                          {order.specifications.dimensions.width}×{order.specifications.dimensions.height}{" "}
                          {order.specifications.dimensions.unit})
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Board: {order.specifications.boardGrade} | Print: {order.specifications.printing}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-xs text-slate-500">Order Total</div>
                          <div className="text-sm font-bold text-slate-900">
                            ₹{order.pricing.totalAmount.toLocaleString("en-IN")}
                          </div>
                          <div className="text-[11px] text-amber-700">
                            Balance Due: ₹{order.pricing.balanceDue.toLocaleString("en-IN")}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="py-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition"
                          >
                            View Timeline & Specs
                          </button>
                          <button
                            onClick={() => {
                              setReorderModalOrder(order);
                              setReorderQty(order.specifications.quantity);
                            }}
                            className="py-2 px-3 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-xl transition flex items-center gap-1"
                          >
                            <RefreshCw className="h-3.5 w-3.5 text-amber-600" /> Reorder
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No active orders in production. Use the button above to request custom packaging quotes.
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/50">
                <h4 className="font-bold text-amber-950 text-xs flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" /> Exact Specification Snapshots
                </h4>
                <p className="text-[11px] text-amber-900/80 leading-relaxed">
                  Historical orders preserve immutable dimensions, flute grammage, and agreed unit rates. Future catalog price updates never alter your past billing records.
                </p>
              </div>

              <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200/50">
                <h4 className="font-bold text-emerald-950 text-xs flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> 1-Click Repeat Orders
                </h4>
                <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                  Repeat orders duplicate your previous approved dielines without having to explain specifications again. You can confirm or adjust quantity with transparent pricing.
                </p>
              </div>

              <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200/50">
                <h4 className="font-bold text-blue-950 text-xs flex items-center gap-1.5 mb-1">
                  <CreditCard className="h-4 w-4 text-blue-600" /> 50% Advance Reconciliation
                </h4>
                <p className="text-[11px] text-blue-900/80 leading-relaxed">
                  Record advance bank transfers or pay via gateway. Our accounts desk verifies manual NEFT/RTGS references within business hours and moves orders straight to production.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ALL CUSTOM ORDERS */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Complete Custom Manufacturing Order Archive</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Order #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Specifications</th>
                    <th className="py-3 px-4">Qty</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Paid / Balance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-900">#{o.orderNumber}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="py-3 px-4 font-medium">
                        {o.specifications.productType} ({o.specifications.dimensions.length}×
                        {o.specifications.dimensions.width}×{o.specifications.dimensions.height}{" "}
                        {o.specifications.dimensions.unit})
                      </td>
                      <td className="py-3 px-4 font-semibold">{o.specifications.quantity.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">₹{o.pricing.totalAmount.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-600 font-medium">₹{o.pricing.totalPaid.toLocaleString("en-IN")}</span> /{" "}
                        <span className="text-amber-700 font-semibold">₹{o.pricing.balanceDue.toLocaleString("en-IN")}</span>
                      </td>
                      <td className="py-3 px-4">{renderStatusBadge(o.orderStatus)}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="text-xs text-amber-700 font-semibold hover:underline"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => {
                            setReorderModalOrder(o);
                            setReorderQty(o.specifications.quantity);
                          }}
                          className="text-xs text-slate-600 hover:text-slate-900 font-medium hover:underline"
                        >
                          Reorder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: QUOTATIONS */}
        {activeTab === "quotations" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Official Manufacturing Quotations</h3>
            {quotations.length > 0 ? (
              <div className="space-y-4">
                {quotations.map((quo) => (
                  <div
                    key={quo._id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-sm text-slate-900">#{quo.quotationNumber}</span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            quo.status === "ACCEPTED"
                              ? "bg-emerald-100 text-emerald-800"
                              : quo.status === "SENT"
                              ? "bg-blue-100 text-blue-800"
                              : quo.status === "CONVERTED_TO_ORDER"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {quo.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        {quo.quantity.toLocaleString("en-IN")} pcs × {quo.productType} ({quo.dimensions.length}×
                        {quo.dimensions.width}×{quo.dimensions.height} {quo.dimensions.unit})
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Board: {quo.boardGrade} | Print: {quo.printing} | Finish: {quo.finish}
                      </p>
                      <p className="text-[11px] text-amber-800">
                        Valid until: {new Date(quo.validUntil).toLocaleDateString("en-IN")} ({quo.estimatedLeadDays} days lead time)
                      </p>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Quoted Rate</div>
                        <div className="text-base font-extrabold text-slate-900">
                          ₹{quo.unitPrice} <span className="text-[10px] font-normal">/ unit</span>
                        </div>
                        <div className="text-xs font-bold text-amber-700">
                          Total: ₹{quo.totalAmount.toLocaleString("en-IN")}
                        </div>
                      </div>

                      {quo.status === "SENT" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptQuotation(quo._id)}
                            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow transition"
                          >
                            Accept Quote
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">No pending quotations found.</div>
            )}
          </div>
        )}

        {/* TAB 4: PAYMENTS & BALANCES */}
        {activeTab === "payments" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Payment & Reconciliation Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Payment Ref</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Associated Order</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">{p.transactionReference}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(p.recordedAt).toLocaleDateString("en-IN")}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">#{p.orderNumber}</td>
                      <td className="py-3 px-4 font-medium">{p.paymentMethod.replace(/_/g, " ")}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">₹{p.amount.toLocaleString("en-IN")}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            p.status === "VERIFIED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {p.status === "VERIFIED" ? "Verified" : "Pending Verification"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{p.notes || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: DOCUMENTS & ARTWORK */}
        {activeTab === "documents" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4">Official Invoices, Receipts & Approved Dielines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        {doc.docType.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-slate-400">Order #{doc.orderNumber}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{doc.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      Uploaded on {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                    >
                      <Download className="h-3.5 w-3.5" /> Download Document
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDER DETAIL MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900">Order #{selectedOrder.orderNumber}</h3>
                    {renderStatusBadge(selectedOrder.orderStatus)}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Specifications Snapshot */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Specifications</h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 grid grid-cols-2 gap-2">
                  <div>
                    <strong>Type:</strong> {selectedOrder.specifications.productType}
                  </div>
                  <div>
                    <strong>Size:</strong> {selectedOrder.specifications.dimensions.length} ×{" "}
                    {selectedOrder.specifications.dimensions.width} × {selectedOrder.specifications.dimensions.height}{" "}
                    {selectedOrder.specifications.dimensions.unit}
                  </div>
                  <div>
                    <strong>Board:</strong> {selectedOrder.specifications.boardGrade}
                  </div>
                  <div>
                    <strong>Print:</strong> {selectedOrder.specifications.printing}
                  </div>
                  <div>
                    <strong>Finish:</strong> {selectedOrder.specifications.finish}
                  </div>
                  <div>
                    <strong>Quantity:</strong> {selectedOrder.specifications.quantity.toLocaleString("en-IN")} pcs
                  </div>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Financial Account</h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Agreed Unit Price:</span>
                    <span className="font-semibold">₹{selectedOrder.pricing.unitPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.pricing.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span>₹{selectedOrder.pricing.taxAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                    <span>Order Total:</span>
                    <span className="text-amber-700">₹{selectedOrder.pricing.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Total Advance Verified:</span>
                    <span>₹{selectedOrder.pricing.totalPaid.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-amber-800 font-bold">
                    <span>Balance Due at Dispatch:</span>
                    <span>₹{selectedOrder.pricing.balanceDue.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Artwork / Proof Versions */}
              {selectedOrder.designFiles && selectedOrder.designFiles.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Artwork & Proofs</h4>
                  <div className="space-y-2">
                    {selectedOrder.designFiles.map((df: any) => (
                      <div
                        key={df.version}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900">Proof Version {df.version}:</span> {df.fileName}
                          <p className="text-[11px] text-slate-500">{df.notes || "Ready for approval"}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={df.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-700 font-medium underline"
                          >
                            View
                          </a>
                          {df.approvalStatus === "APPROVED" ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                              ✓ Approved
                            </span>
                          ) : (
                            <button
                              onClick={() => handleApproveDesign(selectedOrder._id, df.version)}
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1 rounded-lg"
                            >
                              Approve Proof
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Production Status Timeline */}
              {selectedOrder.statusTimeline && selectedOrder.statusTimeline.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Production Timeline
                  </h4>
                  <div className="space-y-3 pl-2 border-l-2 border-amber-300">
                    {selectedOrder.statusTimeline.map((item: any, i: number) => (
                      <div key={i} className="relative pl-4">
                        <div className="absolute -left-[13px] top-1 h-3 w-3 rounded-full bg-amber-600"></div>
                        <div className="text-xs font-bold text-slate-900">{item.status.replace(/_/g, " ")}</div>
                        <p className="text-[11px] text-slate-600">{item.note}</p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.timestamp).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setReorderModalOrder(selectedOrder);
                    setReorderQty(selectedOrder.specifications.quantity);
                    setSelectedOrder(null);
                  }}
                  className="py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Start Repeat Reorder
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="py-2.5 px-4 border border-slate-300 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REORDER CONFIRMATION MODAL */}
        {reorderModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-lg font-extrabold text-slate-900">Request Repeat Order</h3>
                <button
                  onClick={() => setReorderModalOrder(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Repeating order specifications from <strong>#{reorderModalOrder.orderNumber}</strong>:
              </p>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                <p>
                  <strong>Style:</strong> {reorderModalOrder.specifications.productType}
                </p>
                <p>
                  <strong>Size:</strong> {reorderModalOrder.specifications.dimensions.length} ×{" "}
                  {reorderModalOrder.specifications.dimensions.width} ×{" "}
                  {reorderModalOrder.specifications.dimensions.height} {reorderModalOrder.specifications.dimensions.unit}
                </p>
                <p>
                  <strong>Board:</strong> {reorderModalOrder.specifications.boardGrade}
                </p>
                <p>
                  <strong>Rate:</strong> ₹{reorderModalOrder.pricing.unitPrice} / box
                </p>
              </div>

              <form onSubmit={handleConfirmReorder} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Batch Quantity</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={reorderQty}
                    onChange={(e) => setReorderQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[11px] text-slate-500">
                    Estimated total: ₹{(reorderQty * reorderModalOrder.pricing.unitPrice * 1.18).toLocaleString("en-IN")}{" "}
                    (inc. 18% GST)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Order Notes (Optional)</label>
                  <textarea
                    rows={2}
                    value={reorderNotes}
                    onChange={(e) => setReorderNotes(e.target.value)}
                    placeholder="Any changes to packaging date requirements or shipping destination..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingReorder}
                    className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow disabled:opacity-50"
                  >
                    {isSubmittingReorder ? "Creating enquiry..." : "Confirm & Create Repeat Enquiry"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setReorderModalOrder(null)}
                    className="py-3 px-4 border border-slate-300 text-slate-700 font-medium rounded-xl text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
