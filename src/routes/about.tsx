import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Box,
  Clock3,
  Lightbulb,
  Target,
  Users,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      {
        title: "About Quickpack India | Packaging Manufacturer Since 1991",
      },
      {
        name: "description",
        content:
          "Learn about Quickpack India, a packaging manufacturer established in 1991. We provide corrugated boxes, custom packaging, cartons and paper bags across Delhi NCR and India.",
      },
      {
        property: "og:title",
        content: "About Quickpack India | Packaging Manufacturer Since 1991",
      },
      {
        property: "og:description",
        content:
          "Quickpack India has been delivering reliable packaging solutions since 1991, serving e-commerce, FMCG, pharma, electronics, logistics and export businesses.",
      },
      {
        property: "og:type",
        content: "website",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "/about",
      },
    ],
  }),

  component: AboutPage,
});

const values = [
  {
    icon: Target,
    title: "Our Vision",
    description:
      "To become the largest packaging producer in India, recognized for quality, innovation and trust.",
  },
  {
    icon: Award,
    title: "Our Mission",
    description:
      "Deliver high-quality packaging at cost-effective pricing while exceeding customer expectations every time.",
  },
  {
    icon: Box,
    title: "Our Objective",
    description:
      "Be a true one-stop packaging solution — from corrugated to rigid, from concept to delivery.",
  },
  {
    icon: Clock3,
    title: "Our Commitment",
    description:
      "Express delivery within 48 hours so your business never has to wait.",
  },
  {
    icon: Lightbulb,
    title: "R&D Focus",
    description:
      "Constant innovation in materials, structural design and printing for stronger, smarter packaging.",
  },
  {
    icon: Users,
    title: "Customization",
    description:
      "Every box, carton or bag built precisely to your specification, branding and budget.",
  },
];

const industries = [
  "E-commerce",
  "FMCG",
  "Pharma",
  "Electronics",
  "Logistics",
  "Exports",
];

function AboutPage() {
  return (
    <main className="bg-[#f8f5ef] text-[#171717]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8f5ef] via-[#f8f5ef] to-[#eadfce]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="max-w-4xl">
            <div className="mb-7 inline-flex items-center rounded-full border border-[#d8c7ad] bg-[#efe4d1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#8b4a00]">
              About Quickpack India
            </div>

            <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] md:text-6xl lg:text-7xl">
              Three decades of building India's{" "}
              <span className="text-[#c86100]">packaging backbone.</span>
            </h1>

            <p className="mt-7 max-w-3xl text-lg leading-8 text-[#62605b] md:text-xl">
              From a small workshop in 1991 to a trusted name across
              industries — the Quickpack India story is one of consistency,
              craftsmanship and customer obsession.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#dfd5c5] bg-white/70 p-7 backdrop-blur">
              <p className="text-4xl font-bold tracking-tight text-[#c86100]">
                1991
              </p>
              <p className="mt-2 text-sm font-medium text-[#62605b]">
                Established as Krishna Packers
              </p>
            </div>

            <div className="rounded-2xl border border-[#dfd5c5] bg-white/70 p-7 backdrop-blur">
              <p className="text-4xl font-bold tracking-tight text-[#c86100]">
                30+
              </p>
              <p className="mt-2 text-sm font-medium text-[#62605b]">
                Years of packaging experience
              </p>
            </div>

            <div className="rounded-2xl border border-[#dfd5c5] bg-white/70 p-7 backdrop-blur">
              <p className="text-4xl font-bold tracking-tight text-[#c86100]">
                48 hrs
              </p>
              <p className="mt-2 text-sm font-medium text-[#62605b]">
                Express delivery commitment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="grid items-start gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#c86100]">
              Our Story
            </p>

            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.03em] md:text-5xl">
              Since 1991, we've been packing India's growth.
            </h2>
          </div>

          <div className="space-y-6 text-base leading-8 text-[#62605b] md:text-lg">
            <p>
              Established in{" "}
              <strong className="text-[#171717]">1991</strong> as{" "}
              <strong className="text-[#171717]">Krishna Packers</strong>, our
              journey began with a simple promise — make packaging that
              doesn't fail. Three decades on, that promise is still the
              heartbeat of{" "}
              <strong className="text-[#171717]">Quickpack India</strong>.
            </p>

            <p>
              Today, we serve hundreds of clients across{" "}
              <strong className="text-[#171717]">
                e-commerce, FMCG, pharma, electronics, logistics and exports.
              </strong>{" "}
              Our facility in Delhi NCR runs on modern machinery, strict
              quality protocols and a team that genuinely cares about your
              shipment arriving safely.
            </p>

            <p>
              We don't just sell boxes. We build packaging systems that
              protect products, project brands and improve unit economics for
              our clients.
            </p>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="border-y border-[#e0d7c9] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#c86100]">
              Industries We Serve
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Packaging built for growing businesses.
            </h2>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {industries.map((industry) => (
              <div
                key={industry}
                className="rounded-full border border-[#ded6ca] bg-[#f8f5ef] px-5 py-3 text-center text-sm font-semibold"
              >
                {industry}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Drives Us */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#c86100]">
            What Drives Us
          </p>

          <h2 className="mt-4 text-4xl font-bold tracking-[-0.03em] md:text-5xl">
            Vision, mission & commitment.
          </h2>

          <p className="mt-5 text-lg leading-8 text-[#62605b]">
            Everything we build is guided by quality, reliability,
            customization and a commitment to helping our customers grow.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {values.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-3xl border border-[#ded6ca] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[#c86100] hover:shadow-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1e2ce] text-[#c86100] transition-colors group-hover:bg-[#c86100] group-hover:text-white">
                  <Icon size={22} strokeWidth={1.8} />
                </div>

                <h3 className="mt-6 text-xl font-bold">{item.title}</h3>

                <p className="mt-3 text-sm leading-7 text-[#68645d]">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8 lg:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#171717] px-7 py-14 text-white md:px-12 md:py-16 lg:px-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#c86100]/20 blur-3xl" />

          <div className="relative max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e58a35]">
              Ready to work with us?
            </p>

            <h2 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.03em] md:text-5xl">
              Let's pack your next big idea together.
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-white/65 md:text-lg">
              Tell us what you're building. We'll help you choose the right
              packaging, materials, dimensions and finish for your business.
            </p>

            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#c86100] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#ad5300]"
            >
              Get in Touch
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}