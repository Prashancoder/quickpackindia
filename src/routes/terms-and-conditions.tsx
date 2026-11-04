import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, ArrowLeft, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions | QuickPack India" },
      {
        name: "description",
        content: "QuickPack India Terms and Conditions - Commercial, manufacturing, payment, and delivery policies for packaging products.",
      },
    ],
    links: [{ rel: "canonical", href: "/terms-and-conditions" }],
  }),
  component: TermsPage,
});

function TermsPage() {
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
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms and Conditions</h1>
              <p className="text-sm text-slate-500 mt-1">Commercial & Manufacturing Terms | QuickPack India (Est. 1991)</p>
            </div>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 space-y-6 text-sm leading-relaxed border-t border-slate-100 pt-6">
          <section>
            <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>
              By accessing the QuickPack India website or placing an order for standard ready-made packaging or custom-manufactured corrugated boxes, you agree to be bound by these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">2. Manufacturing Specifications & Tolerances</h2>
            <p>
              As is standard in industrial paper corrugation and carton converting:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Dimensions:</strong> Standard industry manufacturing tolerance of ±2mm on box length, width, and depth applies due to paper expansion and creasing.</li>
              <li><strong>Paper GSM & Fluting:</strong> Board grades conform to Indian standard paper mills specifications. Minor shade variations may occur between distinct virgin kraft paper harvest lots.</li>
              <li><strong>Printing:</strong> Print alignment tolerance of ±1.5mm. Color matching is done against approved Pantone or digital proofs.</li>
              <li><strong>Over/Under Run:</strong> On large custom manufacturing runs (exceeding 10,000 units), standard industry production yields may vary by ±5%, with billing adjusted to actual quantity dispatched.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">3. Quotations & Price Validity</h2>
            <p>
              Formal quotations issued by QuickPack India are valid for 15 calendar days from issuance, subject to paper mill raw material index stability. Once an order is confirmed, the agreed price is locked and will not fluctuate during production.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">4. Payment Terms</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Standard E-Commerce Orders:</strong> 100% advance payment via Cashfree Payments or corporate UPI at checkout.</li>
              <li><strong>Custom Manufacturing Orders:</strong> 50% advance upon design proof approval to procure raw materials and initiate die-cutting, with the remaining balance due prior to dispatch or upon delivery as contracted.</li>
              <li><strong>Taxes:</strong> All orders are billed with applicable Goods and Services Tax (GST at 18% on paper packaging) under HSN 4819. Proper tax invoices with GSTIN input credit are provided.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">5. Governing Law & Jurisdiction</h2>
            <p>
              These terms are governed by the laws of India. Any legal disputes arising out of contracts with QuickPack India / Krishna Traders shall be subject to the exclusive jurisdiction of the competent courts in Delhi NCR, India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
