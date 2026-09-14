import { createFileRoute, Link } from "@tanstack/react-router";

import { ArrowRight, BadgeCheck, Factory, MapPin, Truck } from "lucide-react";

import { CTASection } from "@/components/CTASection";

import { categories, productsByCategory } from "@/data/products";

import factoryImg from "@/assets/factory.jpg";

import { ProductBanner } from "@/components/ProductBanner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "QuickPack India | Corrugated Boxes, Mailer Boxes & Mono Cartons",
      },
      {
        name: "description",
        content:
          "QuickPack India manufactures corrugated boxes, premium mailer boxes, mono cartons and paper bags. Packaging built in Delhi NCR, delivered Pan India since 1991.",
      },
      {
        property: "og:title",
        content: "QuickPack India | Packaging Manufacturer Since 1991",
      },
      {
        property: "og:description",
        content:
          "Corrugated boxes, mailer boxes, mono cartons and paper bags for e-commerce, FMCG, pharma, electronics and exports.",
      },
      {
        property: "og:url",
        content: "/",
      },
      {
        property: "og:type",
        content: "website",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const trust = [
  {
    icon: Factory,
    title: "35+ Years",
    text: "Packaging experience since 1991",
  },
  {
    icon: MapPin,
    title: "Pan India",
    text: "Serving customers across India",
  },
  {
    icon: Truck,
    title: "Multiple Industries",
    text: "E-commerce, FMCG, pharma, electronics, logistics & exports",
  },
  {
    icon: BadgeCheck,
    title: "Reliable Packaging",
    text: "Focused on quality, protection and consistency",
  },
];

function HomePage() {
  return (
    <>
      <ProductBanner />

      {/* Our Product Range */}
      <section className="container-page py-16">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold md:text-3xl">
            Our Product Range
          </h2>

          <p className="mt-3 text-muted-foreground">
            Browse the complete QuickPack India catalogue by category — every
            product is made to order in the size, ply and print you need.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <article
              key={cat.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-menu"
            >
              <div className="aspect-4/3 bg-surface">
                <img
                  src={cat.image}
                  alt={`${cat.name} manufactured by QuickPack India`}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-full w-full object-contain p-4"
                />
              </div>

              <div className="flex flex-1 flex-col border-t border-border p-5">
                <h3 className="text-base font-bold">{cat.name}</h3>

                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {productsByCategory(cat.id)
                    .slice(0, 4)
                    .map((product) => (
                      <li key={product.id}>
                        <Link
                          to="/products/$slug"
                          params={{ slug: product.slug }}
                          className="hover:text-primary"
                        >
                          {product.name}
                        </Link>
                      </li>
                    ))}
                </ul>

                <Link
                  to="/products"
                  search={{ category: cat.id }}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  View category
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="border-y border-border bg-surface">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold md:text-3xl">
              About QuickPack India
            </h2>

            <p className="mt-2 text-lg font-medium text-primary">
              Crafting reliable packaging for every industry.
            </p>

            <p className="mt-4 text-muted-foreground">
              QuickPack India is a packaging manufacturer delivering
              high-quality corrugated boxes, mono cartons, and custom packaging
              solutions for businesses across industries.
            </p>

            <p className="mt-4 text-muted-foreground">
              With a legacy of trust and experience since 1991, we focus on
              providing reliable packaging, consistent quality, and solutions
              tailored to our customers&apos; requirements.
            </p>

            <p className="mt-4 text-muted-foreground">
              <strong className="font-semibold text-foreground">
                QuickPack India is the brand name of Krishna Traders
              </strong>
              , our registered business entity. While our customers know us as
              QuickPack India, our official business and GST registration is
              under the name <strong className="font-semibold text-foreground">
                Krishna Traders
              </strong>
              .
            </p>

            <Link
              to="/about"
              className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-accent"
            >
              Read our story
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <img
            src={factoryImg}
            alt="Stacks of corrugated sheets inside the QuickPack India manufacturing facility"
            loading="lazy"
            width={1600}
            height={900}
            className="rounded-xl border border-border object-cover shadow-card"
          />
        </div>
      </section>

      {/* Trust */}
      <section className="container-page py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <Icon className="size-6 text-primary" aria-hidden="true" />

              <h3 className="mt-4 text-lg font-bold">{title}</h3>

              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <CTASection
        title="Need custom packaging?"
        text="Tell us what you need and our team can help you find the right packaging solution for your business."
      />

      <div className="pb-4" />
    </>
  );
}
