import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Box,
  Layers,
  Printer,
  Sparkles,
  Calculator,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileCheck,
  Building,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export const Route = createFileRoute("/custom-packaging")({
  head: () => ({
    meta: [
      {
        title: "Custom Packaging Manufacturing & Instant Quote Calculator | QuickPack India",
      },
      {
        name: "description",
        content:
          "Calculate instant manufacturing quotes for custom corrugated boxes, mailers, and folding cartons. Factory-direct pricing with custom dimensions, 3-ply/5-ply board, and custom printing.",
      },
    ],
    links: [{ rel: "canonical", href: "/custom-packaging" }],
  }),
  component: CustomPackagingPage,
});

const BOX_TYPES = [
  "Corrugated Shipping Box (RSC)",
  "Die-Cut Self Locking Mailer Box",
  "Mono Carton Folding Box",
  "Heavy Duty 5-Ply Master Carton",
  "Custom Rigid Gift Box",
];

const BOARD_GRADES = [
  "3 Ply (B-Flute) Virgin Kraft 180/140/180 GSM",
  "3 Ply (E-Flute) White Kraft Premium Unboxing",
  "5 Ply (B+C Flute) Heavy Duty Export Grade",
  "Mono Carton Duplex Board 350 GSM",
  "7 Ply Heavy Industrial Grade",
];

const PRINTING_OPTIONS = [
  "Plain (Unprinted Natural Brown / White)",
  "1 Color Flexo Logo Print",
  "2 Color Brand Printing",
  "Full Color Offset CMYK High Definition",
];

const FINISH_OPTIONS = [
  "None (Natural Eco Kraft)",
  "Matte Lamination",
  "Gloss Lamination",
  "Spot UV Coating",
];

function CustomPackagingPage() {
  const { user, isAuthenticated } = useAuthStore();

  // Specs state
  const [productType, setProductType] = useState(BOX_TYPES[0]);
  const [length, setLength] = useState(8);
  const [width, setWidth] = useState(6);
  const [height, setHeight] = useState(4);
  const [unit, setUnit] = useState<"inch" | "cm" | "mm">("inch");
  const [boardGrade, setBoardGrade] = useState(BOARD_GRADES[0]);
  const [printing, setPrinting] = useState(PRINTING_OPTIONS[1]);
  const [finish, setFinish] = useState(FINISH_OPTIONS[0]);
  const [quantity, setQuantity] = useState(1000);

  // Calculation state
  const [calcResult, setCalcResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Modal / Quote Submission State
  const [showModal, setShowModal] = useState(false);
  const [customerName, setCustomerName] = useState(user?.name || "");
  const [companyName, setCompanyName] = useState(user?.businessProfile?.companyName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<any>(null);

  // Auto calculate on input change
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      api
        .calculateQuote({
          productType,
          length: Number(length) || 4,
          width: Number(width) || 4,
          height: Number(height) || 2,
          unit,
          boardGrade,
          printing,
          finish,
          quantity: Number(quantity) || 100,
        })
        .then((res) => {
          if (res.success && res.calculation) {
            setCalcResult(res.calculation);
          }
        })
        .catch((err) => {
          console.warn("Quote calculation error:", err);
        })
        .finally(() => {
          setIsCalculating(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [productType, length, width, height, unit, boardGrade, printing, finish, quantity]);

  const handleOpenModal = () => {
    if (user) {
      setCustomerName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
      if (user.businessProfile?.companyName) {
        setCompanyName(user.businessProfile.companyName);
      }
    }
    setShowModal(true);
  };

  const handleRequestOfficialQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !email || !phone) {
      toast.error("Please fill in your name, email, and mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.submitQuoteRequest({
        customerName,
        companyName: companyName || customerName,
        email,
        phone,
        productType,
        length: Number(length),
        width: Number(width),
        height: Number(height),
        unit,
        boardGrade,
        printing,
        finish,
        quantity: Number(quantity),
        notes,
      });

      if (res.success && res.quotation) {
        setSubmittedQuote(res.quotation);
        toast.success(`Formal Quotation #${res.quotation.quotationNumber} generated successfully!`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit quote request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-950 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-600/50 border border-amber-400/30 text-amber-100 mb-3">
              <Calculator className="h-3.5 w-3.5" /> Instant Engineering Cost Estimator
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Custom Packaging Manufacturing Calculator
            </h1>
            <p className="mt-3 text-sm sm:text-base text-amber-100 leading-relaxed">
              Design your boxes to exact millimetre tolerances. Choose flute plies, GSM weight, custom printing and finishes. Get real-time factory unit pricing backed by Krishna Packers' 35+ years of packaging heritage.
            </p>
          </div>
        </div>
      </div>

      {/* Main Calculator Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Box className="h-5 w-5 text-amber-600" /> 1. Box Style & Dimensions
            </h2>

            {/* Box Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Packaging Style</label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
              >
                {BOX_TYPES.map((bt) => (
                  <option key={bt} value={bt}>
                    {bt}
                  </option>
                ))}
              </select>
            </div>

            {/* Dimensions (L x W x H) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Inner Dimensions</label>
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  {(["inch", "cm", "mm"] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnit(u)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium transition ${
                        unit === u ? "bg-white text-amber-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Length ({unit})</label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Width ({unit})</label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Height ({unit})</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.1"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Material & Fluting */}
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 pt-2 flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-600" /> 2. Paperboard & Flute Grade
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Material Specification</label>
              <select
                value={boardGrade}
                onChange={(e) => setBoardGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
              >
                {BOARD_GRADES.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            {/* Printing & Finish */}
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 pt-2 flex items-center gap-2">
              <Printer className="h-5 w-5 text-amber-600" /> 3. Branding, Colors & Finish
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Printing Process</label>
                <select
                  value={printing}
                  onChange={(e) => setPrinting(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                >
                  {PRINTING_OPTIONS.map((po) => (
                    <option key={po} value={po}>
                      {po}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lamination / Coating</label>
                <select
                  value={finish}
                  onChange={(e) => setFinish(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                >
                  {FINISH_OPTIONS.map((fo) => (
                    <option key={fo} value={fo}>
                      {fo}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity */}
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 pt-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" /> 4. Batch Order Quantity
            </h2>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-700">Quantity of Boxes</label>
                <span className="text-sm font-bold text-amber-700">{quantity.toLocaleString("en-IN")} pcs</span>
              </div>
              <input
                type="range"
                min="100"
                max="25000"
                step="100"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {[500, 1000, 2500, 5000, 10000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuantity(preset)}
                    className={`text-xs px-3 py-1 rounded-full border transition ${
                      quantity === preset
                        ? "bg-amber-600 text-white border-amber-600 font-semibold"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {preset.toLocaleString("en-IN")} pcs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Live Estimate Card (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-lg border border-slate-200 p-6 sm:p-8 sticky top-24">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Calculator className="h-5 w-5 text-amber-600" /> Instant Cost Breakdown
              </h3>
              {isCalculating && <Loader2 className="h-4 w-4 animate-spin text-amber-600" />}
            </div>

            {calcResult ? (
              <div className="mt-6 space-y-5">
                {/* Highlight Big Unit Rate */}
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Estimated Factory Unit Rate
                  </span>
                  <div className="text-4xl font-extrabold text-slate-900 mt-1">
                    ₹{calcResult.estimatedUnitPrice.toFixed(2)}{" "}
                    <span className="text-xs font-normal text-slate-500">/ box</span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 mt-1">
                    Volume tier applied for {calcResult.quantity.toLocaleString("en-IN")} units
                  </p>
                </div>

                {/* Specs Summary Pill */}
                <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                  <p>
                    <strong>Size:</strong> {length} × {width} × {height} {unit}
                  </p>
                  <p>
                    <strong>Grade:</strong> {boardGrade.split(" ")[0]} ({boardGrade.split(" ")[1] || "Kraft"})
                  </p>
                  <p>
                    <strong>Print:</strong> {printing}
                  </p>
                </div>

                {/* Detailed Line Items */}
                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex justify-between">
                    <span>Batch Subtotal ({calcResult.quantity.toLocaleString("en-IN")} pcs):</span>
                    <span className="font-semibold text-slate-900">₹{calcResult.subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18% Input Credit Eligible):</span>
                    <span className="font-semibold text-slate-900">₹{calcResult.taxAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Factory Freight:</span>
                    <span className="font-semibold text-emerald-600">
                      {calcResult.shippingCharge === 0 ? "FREE METRO TRANSIT" : `₹${calcResult.shippingCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                    <span>Total Batch Value:</span>
                    <span className="text-amber-700">₹{calcResult.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>50% Manufacturing Advance Required:</span>
                    <span className="font-medium text-slate-700">₹{calcResult.advanceAmount.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Lead time badge */}
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    Estimated Lead Time: <strong>{calcResult.estimatedLeadDays} working days</strong> from proof approval.
                  </span>
                </div>

                {/* Action Button */}
                <button
                  type="button"
                  onClick={handleOpenModal}
                  className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="h-4 w-4" /> Request Official Formal Quote
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Instant estimate. A QuickPack sales engineer verifies dielines & confirms lead times.
                </p>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">Calculating engineering estimate...</div>
            )}
          </div>
        </div>
      </div>

      {/* Quote Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {submittedQuote ? (
              <div className="text-center py-4 space-y-4">
                <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-extrabold text-slate-900">
                  Formal Quotation #{submittedQuote.quotationNumber} Generated!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Your custom packaging quotation for <strong>{submittedQuote.quantity.toLocaleString("en-IN")} pcs</strong> of {submittedQuote.productType} has been recorded.
                </p>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agreed Unit Rate:</span>
                    <span className="font-semibold">₹{submittedQuote.unitPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Order Value:</span>
                    <span className="font-bold text-amber-700">₹{submittedQuote.totalAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Validity:</span>
                    <span>15 days (until {new Date(submittedQuote.validUntil).toLocaleDateString("en-IN")})</span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-4">
                  <Link
                    to="/account/business"
                    onClick={() => setShowModal(false)}
                    className="py-2.5 px-5 bg-amber-600 text-white text-xs font-semibold rounded-xl hover:bg-amber-700 transition"
                  >
                    View in B2B Portal
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSubmittedQuote(null);
                    }}
                    className="py-2.5 px-5 border border-slate-300 text-slate-700 text-xs font-medium rounded-xl hover:bg-slate-50 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <h3 className="text-lg font-extrabold text-slate-900">Request Formal Packaging Quotation</h3>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleRequestOfficialQuote} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Priyanshu Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Brand Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex E-Commerce Logistics"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Special Requirements / Notes</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any particular bursting strength (BF), kraft shade, delivery date target, or sample requirements..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition text-sm disabled:opacity-50 mt-2"
                  >
                    {isSubmitting ? "Generating Official Quote..." : "Submit Quote Request"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
