import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { company } from "@/data/company";

export function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed right-4 bottom-4 z-40 flex flex-col items-end gap-3">
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-card transition-colors hover:bg-accent"
        >
          <ArrowUp className="size-5" aria-hidden="true" />
        </button>
      )}
      <a
        href={`https://wa.me/${company.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with QuickPack India on WhatsApp"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-menu transition-transform hover:scale-105"
      >
        <MessageCircle className="size-5" aria-hidden="true" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>
    </div>
  );
}
