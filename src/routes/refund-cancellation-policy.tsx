import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/refund-cancellation-policy")({
  head: () => ({
    meta: [
      { title: "Refund & Cancellation Policy | QuickPack India" },
      {
        name: "description",
        content: "QuickPack India Refund and Cancellation Policy - Guidelines for order cancellations, replacements, and manufacturing defect claims.",
      },
    ],
    links: [{ rel: "canonical", href: "/refund-cancellation-policy" }],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl bg-white p-8 sm:p-12 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
              <RefreshCw className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Refund & Cancellation Policy</h1>
              <p className="text-sm text-slate-500 mt-1">Guarantees & Claim Procedures | QuickPack India</p>
            </div>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 space-y-6 text-sm leading-relaxed border-t border-slate-100 pt-6">
          <section>
            <h2 className="text-lg font-bold text-slate-900">1. Order Cancellations</h2>
            <div className="space-y-3 mt-2">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-semibold text-slate-900 text-xs">Standard Ready-Made Packaging</p>
                <p className="text-xs text-slate-600 mt-1">
                  You can cancel ready-made box orders anytime prior to dispatch directly from your account or by contacting support. Once handed over to the courier, cancellation is not possible.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="font-semibold text-slate-900 text-xs">Custom Printed & Die-Cut Orders</p>
                <p className="text-xs text-slate-600 mt-1">
                  Because custom manufacturing involves custom dieline fabrication, printing stereos, and specialized paper slitting, custom orders cannot be cancelled once digital design proofs are approved and production has started.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">2. Manufacturing Defects & Quality Guarantee</h2>
            <p>
              QuickPack India stands behind every box manufactured since 1991. We will promptly replace or refund goods if:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The delivered dimensions or flute ply significantly diverge from the ordered technical specifications.</li>
              <li>There is substantial printing misalignment or ink smudge caused by manufacturing errors.</li>
              <li>Boxes have joint pasting separation or severe bursting strength failure under normal transit.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">3. How to Submit a Claim</h2>
            <p>
              To file a replacement or refund claim, please email <a href="mailto:support@quickpack.in" className="text-amber-600 underline">support@quickpack.in</a> within 7 calendar days of receipt with:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your Order Number (e.g. QP-2026-XXXX or B2B-XXXX)</li>
              <li>Photographs showing the issue or defect clearly across sample boxes</li>
              <li>Brief description of the problem</li>
            </ul>
            <p className="mt-2 text-slate-600">
              Our quality engineering manager will inspect the claim within 24 hours. Validated defective batches will be reproduced at zero cost or refunded immediately to your original payment source.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">4. Refund Processing Time</h2>
            <p>
              Approved refunds are credited to the customer's original payment method (bank account, UPI, credit/debit card) within 5 to 7 banking days through our payment gateway. For B2B ledger accounts, credit notes can also be credited against your running ledger balance.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
