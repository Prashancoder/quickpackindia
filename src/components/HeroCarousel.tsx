import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products } from "@/data/products";

const featuredSlugs = [
  "3-ply-corrugated-box",
  "printed-mono-carton-box",
  "5-ply-corrugated-box",
  "earpod-mono-carton-packaging-box",
  "printed-paper-bag",
];

const featured = featuredSlugs
  .map((slug) => products.find((p) => p.slug === slug))
  .filter((p): p is (typeof products)[number] => Boolean(p));

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setPerView(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = Math.max(0, featured.length - perView);
  const next = useCallback(
    () => setIndex((i) => (i >= maxIndex ? 0 : i + 1)),
    [maxIndex],
  );
  const prev = () => setIndex((i) => (i <= 0 ? maxIndex : i - 1));

  useEffect(() => {
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next]);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <ul
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * (100 / perView)}%)` }}
        >
          {featured.map((product, i) => (
            <li
              key={product.id}
              className="shrink-0 px-2"
              style={{ width: `${100 / perView}%` }}
            >
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
                <div className="aspect-4/3 bg-surface">
                  <img
                    src={product.image}
                    alt={`${product.name} — QuickPack India packaging product`}
                    width={1024}
                    height={768}
                    loading={i === 0 ? "eager" : "lazy"}
                    className="h-full w-full object-contain p-4"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-border p-4">
                  <p className="text-sm font-semibold">{product.name}</p>
                  <Link
                    to="/products/$slug"
                    params={{ slug: product.slug }}
                    className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-accent"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={prev}
        aria-label="Previous products"
        className="absolute top-1/2 -left-3 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-card shadow-card transition-colors hover:bg-accent"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next products"
        className="absolute top-1/2 -right-3 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-border bg-card shadow-card transition-colors hover:bg-accent"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>

      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-primary" : "w-2 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
