import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  User as UserIcon,
  X,
  Sparkles,
  Truck,
  ShieldCheck,
  PhoneCall,
  LogOut,
  PackageCheck,
  LayoutDashboard,
  MapPin,
  Building,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";

const navLinkBase =
  "relative text-sm font-semibold tracking-tight transition-colors hover:text-primary";

export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ products: any[]; categories: any[] }>({
    products: [],
    categories: [],
  });
  const [isSearching, setIsSearching] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Dynamic Categories from API with fallback
  const [categories, setCategories] = useState<any[]>([
    { id: "corrugated-boxes", slug: "corrugated-boxes", name: "Corrugated Boxes" },

    { id: "mono-cartons", slug: "mono-cartons", name: "Mono Cartons" },
    { id: "paper-bags", slug: "paper-bags", name: "Paper Bags" },
    { id: "packaging-materials", slug: "packaging-materials", name: "Packaging Materials" },
  ]);
  const [activeCat, setActiveCat] = useState<string>("corrugated-boxes");

  // Stores
  const totalCartItems = useCartStore((state) => state.getTotalItems());
  const openCartDrawer = useCartStore((state) => state.openDrawer);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { user, isAuthenticated, openLoginModal, logout } = useAuthStore();

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch dynamic categories
  useEffect(() => {
    api
      .getCategories()
      .then((res) => {
        if (res.success && res.categories?.length > 0) {
          setCategories(res.categories);
          setActiveCat(res.categories[0].slug);
        }
      })
      .catch(() => { });
  }, []);

  // Search debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults({ products: [], categories: [] });
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.searchSuggestions(searchQuery);
        if (res.success) {
          setSearchResults({
            products: res.products || [],
            categories: res.categories || [],
          });
        }
      } catch {
        // ignore
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close menus on navigation
  useEffect(() => {
    setMegaOpen(false);
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const openMega = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMegaOpen(true);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 160);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md shadow-xs border-b border-border">
      {/* 1. TOP PROMOTIONAL ANNOUNCEMENT BAR */}
      <div className="bg-neutral-900 text-white text-[12px] py-2 px-4 font-medium tracking-wide">
        <div className="container-page flex items-center justify-between">
          <div className="flex items-center gap-6 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex items-center gap-1.5 text-primary">
              <Truck className="size-3.5" />
              <span>Free Pan-India Delivery on Factory Orders</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-white/80">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>GST 18% Inclusive</span>
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-white/80">
              <Sparkles className="size-3.5 text-amber-400" />
              <span>Bulk Factory Discounts</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-white/90 text-xs">
            <a
              href="tel:+919811234567"
              className="hidden lg:flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <PhoneCall className="size-3" />
              <span>+91 9871002637</span>
            </a>
            <Link to="/contact" className="hover:text-primary transition-colors">
              Custom Box Quote →
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className="container-page flex h-16 items-center justify-between gap-4 md:h-18">
        {/* Brand Logo */}
        <Link to="/" className="font-display text-xl font-black tracking-tight sm:text-2xl">
          QuickPack<span className="text-primary">India</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          <Link
            to="/"
            className={navLinkBase}
            activeProps={{ className: "text-primary" }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>

          <Link
            to="/products"
            className={navLinkBase}
            activeProps={{ className: "text-primary" }}
          >
            Our Products
          </Link>

          <Link to="/about" className={navLinkBase} activeProps={{ className: "text-primary" }}>
            About Us
          </Link>

          {/* Categories Mega Dropdown */}
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
              className={`${navLinkBase} inline-flex items-center gap-1 ${pathname.startsWith("/products") ? "text-primary" : ""
                }`}
            >
              All Material
              <ChevronDown
                className={`size-4 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""
                  }`}
                aria-hidden="true"
              />
            </button>

            {megaOpen && (
              <div
                className="animate-menu-in absolute top-full left-1/2 z-50 w-[48rem] -translate-x-1/2 pt-4"
                onMouseEnter={openMega}
                onMouseLeave={scheduleClose}
              >
                <div className="overflow-hidden rounded-2xl border border-border bg-popover shadow-menu">
                  <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-3.5">
                    <Link
                      to="/products"
                      className="inline-flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary"
                    >
                      Browse Complete Catalogue
                      <ArrowRight className="size-4" />
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      Direct from Delhi NCR Manufacturing Unit
                    </span>
                  </div>

                  <div className="grid grid-cols-[1.2fr_1fr]">
                    {/* Left: categories listing */}
                    <div className="p-5">
                      <p className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                        Product Categories
                      </p>
                      <ul className="space-y-1">
                        {categories.map((cat) => (
                          <li key={cat.slug || cat.id}>
                            <Link
                              to="/products"
                              search={{ category: cat.slug || cat.id }}
                              onMouseEnter={() => setActiveCat(cat.slug || cat.id)}
                              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${activeCat === (cat.slug || cat.id)
                                ? "bg-accent text-primary"
                                : "text-foreground hover:bg-accent/60"
                                }`}
                            >
                              <span>{cat.name}</span>
                              <ChevronRight className="size-4 opacity-50" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right: Category quick banner */}
                    <div className="border-l border-border bg-surface/40 p-5 flex flex-col justify-between">
                      <div>
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                          FACTORY DIRECT
                        </span>
                        <h4 className="mt-2 text-sm font-bold text-foreground">
                          Custom Printed &amp; Plain Boxes
                        </h4>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          Bulk supply in 3-ply, 5-ply, premium kraft mailers, mono cartons, and
                          retail paper bags.
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border">
                        <Link
                          to="/products"
                          className="flex items-center justify-center gap-2 rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground shadow-xs hover:opacity-90"
                        >
                          View All Products
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            to="/products"
            search={{ category: "corrugated-boxes" }}
            className={navLinkBase}
          >
            Corrugated Boxes
          </Link>



          <Link to="/custom-packaging" className={navLinkBase} activeProps={{ className: "text-primary" }}>
            Custom Manufacturing
          </Link>

          <Link to="/blog" className={navLinkBase} activeProps={{ className: "text-primary" }}>
            News &amp; Guides
          </Link>


        </nav>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Search Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-accent"
              aria-label="Search catalogue"
            >
              <Search className="size-4.5" />
            </button>
          </div>

          {/* Wishlist Button */}
          <Link
            to="/wishlist"
            className="relative flex size-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-accent"
            aria-label="Wishlist"
          >
            <Heart className="size-4.5" />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white shadow-xs">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Cart Button */}
          <button
            type="button"
            onClick={openCartDrawer}
            className="relative flex size-10 items-center justify-center rounded-full border border-border bg-surface text-foreground transition-colors hover:bg-accent"
            aria-label="Cart"
          >
            <ShoppingBag className="size-4.5" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-xs animate-scale-in">
                {totalCartItems}
              </span>
            )}
          </button>

          {/* User Account / Auth Dropdown */}
          <div className="relative">
            {isAuthenticated && user ? (
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex size-10 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary font-bold transition-colors hover:bg-primary/20"
                aria-label="User Account"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-accent"
              >
                <UserIcon className="size-3.5" />
                Sign In
              </button>
            )}

            {/* User Dropdown Menu */}
            {userMenuOpen && isAuthenticated && user && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-menu z-50 animate-menu-in">
                <div className="border-b border-border px-3 py-2">
                  <p className="text-xs font-bold text-foreground">{user.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  {user.role === "ADMIN" && (
                    <span className="mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      ADMINISTRATOR
                    </span>
                  )}
                </div>

                <div className="py-1">
                  {user.role === "ADMIN" && (
                    <Link
                      to="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10"
                    >
                      <LayoutDashboard className="size-4" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/account/business"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10"
                  >
                    <Building className="size-4" />
                    B2B Corporate Portal
                  </Link>
                  <Link
                    to="/account"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium hover:bg-accent"
                  >
                    <UserIcon className="size-4 text-muted-foreground" />
                    My Profile
                  </Link>
                  <Link
                    to="/account"
                    search={{ tab: "orders" }}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium hover:bg-accent"
                  >
                    <PackageCheck className="size-4 text-muted-foreground" />
                    My Orders
                  </Link>
                  <Link
                    to="/account"
                    search={{ tab: "addresses" }}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium hover:bg-accent"
                  >
                    <MapPin className="size-4 text-muted-foreground" />
                    Saved Addresses
                  </Link>
                </div>

                <div className="border-t border-border pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Menu */}
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-lg border border-border lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* 3. LIVE SEARCH MODAL / DROPDOWN */}
      {searchOpen && (
        <div className="border-t border-border bg-surface p-4 shadow-lg">
          <div className="container-page max-w-3xl">
            <div className="relative">
              <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search corrugated boxes, mailers, 3-ply, 5-ply, paper bags..."
                className="h-12 w-full rounded-xl border border-border bg-card pr-10 pl-12 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Search Suggestions dropdown */}
            {(searchResults.products.length > 0 || searchResults.categories.length > 0) && (
              <div className="mt-3 rounded-xl border border-border bg-card p-4 shadow-card">
                {searchResults.categories.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Categories
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {searchResults.categories.map((c) => (
                        <Link
                          key={c._id || c.slug}
                          to="/products"
                          search={{ category: c.slug }}
                          onClick={() => setSearchOpen(false)}
                          className="rounded-full bg-surface border border-border px-3 py-1 text-xs font-semibold hover:border-primary"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.products.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Products
                    </p>
                    <ul className="mt-2 divide-y divide-border">
                      {searchResults.products.map((p) => (
                        <li key={p._id || p.slug}>
                          <Link
                            to="/products/$slug"
                            params={{ slug: p.slug }}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center justify-between py-2 hover:text-primary"
                          >
                            <span className="text-sm font-medium">{p.name}</span>
                            <span className="text-xs font-bold text-primary">
                              From ₹{p.minPrice || p.basePrice}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MOBILE NAVIGATION DRAWER */}
      {mobileOpen && (
        <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background lg:hidden">
          <nav className="container-page py-4" aria-label="Mobile navigation">
            <ul className="divide-y divide-border text-sm">
              <li>
                <Link to="/" className="block py-3 font-bold">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="block py-3 font-bold text-primary">
                  All Products Catalogue
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug || cat.id}>
                  <Link
                    to="/products"
                    search={{ category: cat.slug || cat.id }}
                    className="block py-2.5 text-muted-foreground hover:text-foreground font-medium"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/custom-packaging" className="block py-3 font-bold text-foreground hover:text-primary">
                  Custom Box Calculator
                </Link>
              </li>
              <li>
                <Link to="/account/business" className="block py-3 font-bold text-primary">
                  B2B Corporate Orders &amp; RFQs
                </Link>
              </li>
              <li>
                <Link to="/blog" className="block py-3 font-bold">
                  News &amp; Packaging Guides
                </Link>
              </li>
              <li>
                <Link to="/about" className="block py-3 font-bold">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="block py-3 font-bold">
                  Contact &amp; Custom Quote
                </Link>
              </li>
              {!isAuthenticated ? (
                <li className="py-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      openLoginModal();
                    }}
                    className="flex w-full items-center justify-center rounded-lg bg-primary py-2.5 font-bold text-primary-foreground"
                  >
                    Sign In / Register
                  </button>
                </li>
              ) : (
                <li className="py-3">
                  <Link
                    to="/account"
                    className="flex w-full items-center justify-center rounded-lg border border-border bg-surface py-2.5 font-bold"
                  >
                    My Account Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
