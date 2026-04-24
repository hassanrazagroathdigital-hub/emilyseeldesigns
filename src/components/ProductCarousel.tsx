import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type CarouselSlide = {
  src: string;
  alt: string;
  fit?: "cover" | "contain";
  enhance?: boolean;
  position?: "center" | "top" | "bottom";
};

export function ProductCarousel({ slides }: { slides: CarouselSlide[] }) {
  const [index, setIndex] = useState(0);
  const total = slides.length;

  const go = (next: number) => setIndex((next + total) % total);

  return (
    <div className="w-full">
      <div className="relative h-[180px] md:h-[220px] overflow-hidden bg-white">
        {slides.map((slide, i) => {
          const fit = slide.fit ?? "cover";
          return (
            <img
              key={i}
              src={slide.src}
              alt={slide.alt}
              loading="lazy"
              className="absolute inset-0 w-full h-full transition-opacity duration-300 ease-in-out"
              style={{
                objectFit: fit,
                objectPosition: slide.position ?? "center",
                opacity: i === index ? 1 : 0,
                filter: slide.enhance ? "contrast(1.15) brightness(1.05)" : undefined,
                backgroundColor: fit === "contain" ? "#ffffff" : undefined,
              }}
            />
          );
        })}

        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-ink transition-opacity"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center text-ink transition-opacity"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex justify-center items-center gap-1.5 py-3 bg-card">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="w-2 h-2 rounded-full transition-colors"
            style={{
              backgroundColor: i === index ? "#C0392B" : "transparent",
              border: i === index ? "1px solid #C0392B" : "1px solid #C9C4BC",
            }}
          />
        ))}
      </div>
    </div>
  );
}
