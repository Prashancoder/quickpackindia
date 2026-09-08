import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import threePlyImg from "@/assets/18.webp";
import kraftBoxImg from "@/assets/mailer-boxes.jpg";
import mailerBoxImg from "@/assets/mailer-boxes.jpg";
import mailerBoxxImg from "@/assets/mailer-boxes.jpg";

const banners = [
    {
        title: "3 Ply Corrugated Box",
        image: threePlyImg,
        link: "/products/3-ply-corrugated-box",
    },
    {
        title: "Premium Imported Kraft Corrugated Boxes",
        image: kraftBoxImg,
        link: "/products/premium-imported-kraft-corrugated-boxes",
    },
    {
        title: "Luxury Packaging Mailer Box",
        image: mailerBoxImg,
        link: "/products/mailer-box",
    },
];

export function ProductBanner() {
    const [current, setCurrent] = useState(0);

    const nextSlide = () => {
        setCurrent((prev) => (prev + 1) % banners.length);
    };

    const prevSlide = () => {
        setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
    };

    // Auto slide
    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 4500);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative w-full overflow-hidden bg-[#eeeeee] py-8 md:py-10">
            {/* Background pattern */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `
            linear-gradient(135deg, rgba(0,0,0,0.08) 25%, transparent 25%),
            linear-gradient(225deg, rgba(0,0,0,0.08) 25%, transparent 25%),
            linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%),
            linear-gradient(315deg, rgba(0,0,0,0.05) 25%, #eeeeee 25%)
          `,
                    backgroundSize: "80px 80px",
                    backgroundPosition:
                        "0 0, 0 0, 40px 40px, -40px -40px",
                }}
            />

            <div className="relative mx-auto max-w-[1800px] px-4">
                {/* Desktop */}
                <div className="hidden items-center gap-10 lg:flex">
                    {banners.map((banner, index) => (
                        <a
                            key={banner.title}
                            href={banner.link}
                            className={`group relative flex-1 overflow-hidden rounded-2xl bg-white shadow-[8px_10px_0_rgba(0,0,0,0.18)] transition-transform duration-300 ${index === current ? "scale-[1.01]" : ""
                                }`}
                        >
                            {/* Image */}
                            <div className="relative aspect-[1.8/1] overflow-hidden">
                                <img
                                    src={banner.image}
                                    alt={banner.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading={index === 0 ? "eager" : "lazy"}
                                />
                            </div>

                            {/* Bottom title */}
                            <div className="flex min-h-[96px] items-center justify-center bg-black/70 px-5 py-4">
                                <h2 className="text-center text-xl font-bold leading-tight text-white xl:text-2xl">
                                    {banner.title}
                                </h2>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Mobile / Tablet */}
                <div className="lg:hidden">
                    <a
                        href={banners[current].link}
                        className="group relative block overflow-hidden rounded-2xl bg-white shadow-[8px_10px_0_rgba(0,0,0,0.18)]"
                    >
                        <div className="aspect-[1.55/1] overflow-hidden">
                            <img
                                src={banners[current].image}
                                alt={banners[current].title}
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="flex min-h-[90px] items-center justify-center bg-black/70 px-5 py-4">
                            <h2 className="text-center text-xl font-bold text-white">
                                {banners[current].title}
                            </h2>
                        </div>
                    </a>
                </div>

                {/* Left Arrow */}
                <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous products"
                    className="absolute left-2 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:scale-105 hover:bg-white md:left-4"
                >
                    <ChevronLeft className="size-6" />
                </button>

                {/* Right Arrow */}
                <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next products"
                    className="absolute right-2 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:scale-105 hover:bg-white md:right-4"
                >
                    <ChevronRight className="size-6" />
                </button>

                {/* Dots */}
                <div className="mt-5 flex justify-center gap-2">
                    {banners.map((banner, index) => (
                        <button
                            key={banner.title}
                            type="button"
                            aria-label={`Go to slide ${index + 1}`}
                            onClick={() => setCurrent(index)}
                            className={`h-2 rounded-full transition-all ${current === index
                                ? "w-7 bg-primary"
                                : "w-2 bg-black/30"
                                }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}