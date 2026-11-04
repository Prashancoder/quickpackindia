import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Lock, FileText, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | QuickPack India" },
      {
        name: "description",
        content: "QuickPack India Privacy Policy - How we collect, use, and protect your personal and business packaging order information.",
      },
    ],
    links: [{ rel: "canonical", href: "/privacy-policy" }],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
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
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-sm text-slate-500 mt-1">Last Updated: October 2026 | QuickPack India (Est. 1991)</p>
            </div>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 space-y-6 text-sm leading-relaxed border-t border-slate-100 pt-6">
          <section>
            <h2 className="text-lg font-bold text-slate-900">1. Introduction</h2>
            <p>
              QuickPack India (formerly known as Krishna Packers / Krishna Traders, established in 1991) operates the website and ecommerce portal for corrugated boxes, mono cartons, mailer boxes, and custom packaging. We are committed to safeguarding the privacy and security of our retail customers, wholesale partners, and B2B corporate buyers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">2. Information We Collect</h2>
            <p>To process orders, generate manufacturing estimates, and deliver packaging across India, we collect:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Contact Information:</strong> Full name, company or trading name, email address, phone number.</li>
              <li><strong>Delivery & Billing Details:</strong> Factory/office address, PIN code, landmark, city, state, and GSTIN (for B2B tax invoicing).</li>
              <li><strong>Order & Technical Specifications:</strong> Packaging dimensions (L×W×H), flute/ply grades, printing artwork files, quantity tiers, and sample proof approvals.</li>
              <li><strong>Transaction Data:</strong> Payment transaction references, advance payments, and reconciliation status. We do not store raw credit/debit card numbers or UPI PINs on our servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">3. How We Use Your Information</h2>
            <p>Your information is used strictly to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Fulfill orders, dispatch consignments, and deliver via verified logistics partners.</li>
              <li>Provide instant engineering cost estimates and formal manufacturing quotations.</li>
              <li>Maintain your B2B account ledger, repeat order history, and approved artwork versions.</li>
              <li>Send critical transactional updates via email/SMS (order confirmations, dispatch tracking, invoices).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">4. Artwork and Confidential Design Files</h2>
            <p>
              All customer-supplied dielines, branding logos, trade designs, and packaging artwork remain your exclusive intellectual property. QuickPack India treats all custom artwork as strictly confidential and will never resell or distribute your proprietary design files to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">5. Payment Security</h2>
            <p>
              Online transactions are securely processed through RBI-authorized payment gateways (Cashfree Payments) adhering to PCI-DSS Level 1 compliance and 256-bit SSL encryption.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">6. Contact Us</h2>
            <p>
              If you have any questions regarding this Privacy Policy or wish to modify your business details, please reach out:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-2">
              <p className="font-semibold text-slate-900">QuickPack India (Krishna Traders)</p>
              <p>Email: <a href="mailto:support@quickpack.in" className="text-amber-600 underline">support@quickpack.in</a></p>
              <p>Phone: +91 98710 02637 / +91 98112 52637</p>
              <p>Delhi NCR, India</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
