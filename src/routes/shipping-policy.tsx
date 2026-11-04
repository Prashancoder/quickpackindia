import { createFileRoute, Link } from "@tanstack/react-router";
import { Truck, ArrowLeft, Clock, MapPin, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy | QuickPack India" },
      {
        name: "description",
        content: "QuickPack India Shipping Policy - Transit timelines, factory dispatch, Pan India freight, and delivery guidelines.",
      },
    ],
    links: [{ rel: "canonical", href: "/shipping-policy" }],
  }),
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
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
              <Truck className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shipping Policy</h1>
              <p className="text-sm text-slate-500 mt-1">Transit & Delivery Operations | QuickPack India</p>
            </div>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 space-y-6 text-sm leading-relaxed border-t border-slate-100 pt-6">
          <section>
            <h2 className="text-lg font-bold text-slate-900">1. Service Coverage & Pan India Dispatch</h2>
            <p>
              QuickPack India manufactures and dispatches packaging materials directly from our production plants in Delhi NCR to over 19,000 PIN codes across India via surface express, dedicated commercial trucks, and trusted cargo logistics partners (including Delhivery, VRL Logistics, TCI Express, and Blue Dart).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">2. Processing & Dispatch Timelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" /> Standard In-Stock Packaging
                </h3>
                <p className="text-xs text-slate-600 mt-2">
                  Dispatched within 24 to 48 hours of payment verification. Typical transit time is 1-2 days for Delhi NCR and 3-5 business days for major Indian metros.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" /> Custom Manufacturing Orders
                </h3>
                <p className="text-xs text-slate-600 mt-2">
                  Standard production lead time is 7 to 10 working days after digital artwork approval and advance payment confirmation. Dispatched in bundled, weather-wrapped palletized loads.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">3. Shipping Charges & Free Freight Threshold</h2>
            <p>
              Shipping costs are calculated based on consignment volumetric weight and destination zone:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Free Shipping:</strong> Standard ready-made packaging orders over ₹5,000 qualify for free surface delivery within serviceable metro zones.</li>
              <li><strong>Bulk Truckloads (B2B):</strong> For orders exceeding 10,000 boxes or full truckload (FTL) orders, dedicated freight quotes are arranged with direct factory loading.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-900">4. Consignment Tracking & Delivery Inspection</h2>
            <p>
              Once your order leaves our facility, you will receive an automated dispatch notification with the courier docket number and live tracking link.
            </p>
            <p className="mt-2 text-slate-600">
              <strong>Important:</strong> Please inspect the outer strapped bundles upon delivery. In the rare event of transit damage or bundle shortage, please note it on the Proof of Delivery (POD) challan and notify us within 48 hours.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
