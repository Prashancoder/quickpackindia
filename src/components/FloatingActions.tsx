
import { useEffect, useState } from "react";
import { ArrowUp, Phone } from "lucide-react";

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
      {/* Back to Top */}
      {showTop && (
        <button
          type="button"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          aria-label="Back to top"
          className="grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-card transition-all hover:bg-accent hover:scale-105"
        >
          <ArrowUp className="size-5" aria-hidden="true" />
        </button>
      )}

      {/* Call Button */}
      <a
        href="tel:+919871002637"
        aria-label="Call QuickPack India"
        className="grid size-14 place-items-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:scale-110 hover:bg-blue-700"
      >
        <Phone className="size-6" aria-hidden="true" />
      </a>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/919871002637"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with QuickPack India on WhatsApp"
        className="group relative grid size-16 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-[#20BD5A]"
      >
        {/* Pulse Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping" />

        {/* WhatsApp Icon */}
        <svg
          viewBox="0 0 32 32"
          className="relative z-10 size-9 fill-white"
          aria-hidden="true"
        >
          <path d="M19.11 17.4c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.63 1.11 2.81c.14.18 1.92 2.93 4.65 4.11.65.28 1.15.45 1.55.58.65.21 1.24.18 1.7.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z" />
          <path d="M16.02 3.2c-7.08 0-12.84 5.76-12.84 12.84 0 2.26.59 4.47 1.71 6.41L3.1 28.8l6.49-1.7a12.8 12.8 0 0 0 6.43 1.73h.01c7.08 0 12.84-5.76 12.84-12.84S23.1 3.2 16.02 3.2zm0 23.42h-.01a10.58 10.58 0 0 1-5.39-1.48l-.39-.23-3.85 1.01 1.03-3.75-.25-.4a10.58 10.58 0 1 1 8.86 4.85z" />
        </svg>

        {/* Small Notification Dot */}
        <span className="absolute right-0.5 top-0.5 z-20 size-3 rounded-full border-2 border-white bg-red-500" />
      </a>
    </div>
  );
}
