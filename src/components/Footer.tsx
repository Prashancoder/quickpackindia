import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { categories } from "@/data/products";
import { company } from "@/data/company";

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-display text-xl font-extrabold tracking-tight">
            QuickPack<span className="text-primary">India</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed opacity-80">
            Corrugated boxes, mailer boxes, mono cartons and custom packaging,
            manufactured in Delhi NCR since 1991.
          </p>
          <p className="mt-4 text-xs opacity-60">
            QuickPack India is the online brand identity of {company.legalName}.
          </p>
        </div>

        <nav className="text-sm" aria-label="Footer navigation">
          <h2 className="font-display text-sm font-bold tracking-wide uppercase">
            Quick Links
          </h2>
          <ul className="mt-4 space-y-2 opacity-85">
            <li>
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-primary">
                All Products
              </Link>
            </li>
            <li>
              <Link to="/custom-packaging" className="hover:text-primary">
                Custom Box Calculator
              </Link>
            </li>
            <li>
              <Link to="/account/business" className="hover:text-primary">
                B2B Corporate Portal
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-primary">
                Packaging News &amp; Guides
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact &amp; Factory Visit
              </Link>
            </li>
          </ul>
        </nav>

        <nav className="text-sm" aria-label="Legal and policies">
          <h2 className="font-display text-sm font-bold tracking-wide uppercase">
            Policies &amp; Legal
          </h2>
          <ul className="mt-4 space-y-2 opacity-85">
            <li>
              <Link to="/privacy-policy" className="hover:text-primary">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-and-conditions" className="hover:text-primary">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link to="/shipping-policy" className="hover:text-primary">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link to="/refund-cancellation-policy" className="hover:text-primary">
                Refund &amp; Cancellation
              </Link>
            </li>
          </ul>

          <h2 className="font-display text-sm font-bold tracking-wide uppercase mt-6">
            Get in touch
          </h2>
          <ul className="mt-3 space-y-2 opacity-85 text-xs">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
              <a href={`tel:${company.phone}`}>{company.phoneDisplay}</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span>{company.location}</span>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-ink-foreground/15">
        <div className="container-page flex flex-col gap-2 py-5 text-xs opacity-70 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} QuickPack India. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy-policy" className="hover:underline">Privacy</Link>
            <Link to="/terms-and-conditions" className="hover:underline">Terms</Link>
            <Link to="/shipping-policy" className="hover:underline">Shipping</Link>
            <Link to="/refund-cancellation-policy" className="hover:underline">Refunds</Link>
            <span>GST No. 07AZTPS9770M2Z0 · {company.legalName}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
