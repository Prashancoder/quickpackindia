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
            Company
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
                Products
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-primary">
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>

        <nav className="text-sm" aria-label="Product categories">
          <h2 className="font-display text-sm font-bold tracking-wide uppercase">
            Products
          </h2>
          <ul className="mt-4 space-y-2 opacity-85">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  to="/products"
                  search={{ category: cat.id }}
                  className="hover:text-primary"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-sm">
          <h2 className="font-display text-sm font-bold tracking-wide uppercase">
            Get in touch
          </h2>
          <ul className="mt-4 space-y-3 opacity-85">
            <li className="flex items-start gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={`tel:${company.phone}`}>{company.phoneDisplay}</a>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{company.location}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink-foreground/15">
        <div className="container-page flex flex-col gap-1 py-5 text-xs opacity-70 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} QuickPack India. All rights reserved.</p>
          <p>GST No. 07AZTPS9770M2Z0 · {company.legalName}</p>
        </div>
      </div>
    </footer>
  );
}
