import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, ChevronRight, Menu, Minus, Plus, X } from "lucide-react";
import {
  categories,
  productsByCategory,
  type CategoryId,
} from "@/data/products";

const navLinkBase =
  "relative text-sm font-semibold tracking-tight transition-colors hover:text-primary";

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeCat, setActiveCat] = useState<CategoryId>(categories[0].id);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<CategoryId | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const productsActive = pathname.startsWith("/products");

  // Close menus on navigation
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 160);
  };

  const activeProducts = productsByCategory(activeCat);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-18">
        <Link to="/" className="font-display text-lg font-extrabold tracking-tight md:text-xl">
          QuickPack<span className="text-primary">India</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
          <Link
            to="/"
            className={navLinkBase}
            activeProps={{ className: "text-primary" }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
          <Link to="/about" className={navLinkBase} activeProps={{ className: "text-primary" }}>
            About Us
          </Link>

          <div
            className="relative"
            onMouseEnter={openMega}
            onMouseLeave={scheduleClose}
            onKeyDown={(e) => e.key === "Escape" && setMegaOpen(false)}
          >
            <button
              type="button"
              aria-expanded={megaOpen}
              aria-haspopup="true"
              onClick={() => setMegaOpen((v) => !v)}
              className={`${navLinkBase} inline-flex items-center gap-1 ${
                productsActive ? "text-primary" : ""
              }`}
            >
              Products
              <ChevronDown
                className={`size-4 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {megaOpen && (
              <div
                className="animate-menu-in absolute top-full left-1/2 z-50 w-[46rem] -translate-x-1/2 pt-4"
                onMouseEnter={openMega}
                onMouseLeave={scheduleClose}
              >
                <div className="overflow-hidden rounded-xl border border-border bg-popover shadow-menu">
                  <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-3">
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary"
                    >
                      All Products
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      Complete QuickPack India catalogue
                    </span>
                  </div>

                  <div className="grid grid-cols-[1.1fr_1fr]">
                    {/* Left: products of hovered category */}
                    <div className="p-5">
                      <p className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        {categories.find((c) => c.id === activeCat)?.name}
                      </p>
                      <ul className="space-y-1">
                        {activeProducts.slice(0, 6).map((product) => (
                          <li key={product.id}>
                            <Link
                              to="/products/$slug"
                              params={{ slug: product.slug }}
                              className="block rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              {product.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/products"
                        search={{ category: activeCat }}
                        className="mt-3 inline-flex items-center gap-1.5 px-2 text-sm font-semibold text-primary hover:underline"
                      >
                        View All
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </Link>
                    </div>

                    {/* Right: categories */}
                    <div className="border-l border-border bg-surface/60 p-3">
                      <ul>
                        {categories.map((cat) => (
                          <li key={cat.id}>
                            <Link
                              to="/products"
                              search={{ category: cat.id }}
                              onMouseEnter={() => setActiveCat(cat.id)}
                              onFocus={() => setActiveCat(cat.id)}
                              className={`flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                                activeCat === cat.id
                                  ? "bg-accent text-accent-foreground"
                                  : "text-foreground hover:bg-accent/60"
                              }`}
                            >
                              {cat.name}
                              <ChevronRight className="size-4 opacity-60" aria-hidden="true" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="border-t border-border px-5 py-3">
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                    >
                      View All Products
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link to="/contact" className={navLinkBase} activeProps={{ className: "text-primary" }}>
            Contact Us
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/contact"
            className="hidden rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Get a Quote
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-md border border-border lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background lg:hidden">
          <nav className="container-page py-4" aria-label="Mobile navigation">
            <ul className="divide-y divide-border">
              <li>
                <Link to="/" className="block py-3 font-semibold">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="block py-3 font-semibold">
                  About Us
                </Link>
              </li>
              <li className="py-2">
                <Link
                  to="/products"
                  className={`block py-1.5 font-semibold ${productsActive ? "text-primary" : ""}`}
                >
                  All Products
                </Link>
                <ul className="mt-1 space-y-1">
                  {categories.map((cat) => {
                    const open = openAccordion === cat.id;
                    return (
                      <li key={cat.id} className="rounded-md bg-surface">
                        <button
                          type="button"
                          aria-expanded={open}
                          onClick={() => setOpenAccordion(open ? null : cat.id)}
                          className="flex w-full items-center justify-between gap-2 px-3 py-3 text-left text-sm font-medium"
                        >
                          {cat.name}
                          {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
                        </button>
                        {open && (
                          <ul className="px-3 pb-3">
                            {productsByCategory(cat.id).map((product) => (
                              <li key={product.id}>
                                <Link
                                  to="/products/$slug"
                                  params={{ slug: product.slug }}
                                  className="block py-2 text-sm text-muted-foreground"
                                >
                                  {product.name}
                                </Link>
                              </li>
                            ))}
                            <li>
                              <Link
                                to="/products"
                                search={{ category: cat.id }}
                                className="inline-block py-2 text-sm font-semibold text-primary"
                              >
                                View All →
                              </Link>
                            </li>
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li>
                <Link to="/contact" className="block py-3 font-semibold">
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
