import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Desktop banner
import banner1 from "@/assets/banner/ok.png";

// Mobile banner
import banner1Mobile from "@/assets/banner/ok-mobile.png";

const banners = [
    {
        desktop: banner1,
        mobile: banner1Mobile,
        alt: "QuickPackIndia Corrugated Boxes",
    },

    // Add more banners like this:
    // {
    //   desktop: banner2,
    //   mobile: banner2Mobile,
    //   alt: "QuickPackIndia Packaging Solutions",
    // },
];

export default function BannerCarousel() {
    const [current, setCurrent] = useState(0);

    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
    };

    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const banner = banners[current];

    return (
        <section className="relative w-full overflow-hidden">
            <picture>
                {/* Mobile Banner */}
                <source
                    media="(max-width: 767px)"
                    srcSet={banner.mobile}
                />

                {/* Desktop Banner */}
                <img
                    src={banner.desktop}
                    alt={banner.alt}
                    className="block h-auto w-full"
                />
            </picture>

            {/* Controls - only show when there are multiple banners */}
            {banners.length > 1 && (
                <>
                    {/* Previous Button */}
                    <button
                        type="button"
                        onClick={prevSlide}
                        aria-label="Previous banner"
                        className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/60 sm:left-5 sm:size-12"
                    >
                        <ChevronLeft
                            className="size-6 sm:size-7"
                            aria-hidden="true"
                        />
                    </button>

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={nextSlide}
                        aria-label="Next banner"
                        className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/60 sm:right-5 sm:size-12"
                    >
                        <ChevronRight
                            className="size-6 sm:size-7"
                            aria-hidden="true"
                        />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-5">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setCurrent(index)}
                                aria-label={`Go to banner ${index + 1}`}
                                className={`h-2 rounded-full transition-all duration-300 ${current === index
                                    ? "w-7 bg-white"
                                    : "w-2 bg-white/60 hover:bg-white"
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}