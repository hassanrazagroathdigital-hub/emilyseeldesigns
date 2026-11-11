import { ProductCarousel, type CarouselSlide } from "@/components/ProductCarousel";
import { usePublicProjects } from "@/lib/cms/public";
import type { Project } from "@/lib/cms/types";

function toSlides(p: Project): CarouselSlide[] {
  return p.gallery
    .filter((s) => s.url)
    .map((s) => ({
      src: s.url,
      alt: s.alt || p.title,
      fit: s.fit,
      enhance: s.enhance,
      position: s.position,
      bg: s.bg ?? undefined,
    }));
}

/** Industrial-design project cards (home page + Industrial Design page). */
export function ProjectGrid({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const { items, loading } = usePublicProjects({ featuredOnly });

  return (
    <div className="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading
        ? Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg overflow-hidden flex flex-col animate-pulse"
              aria-hidden="true"
            >
              <div className="h-[180px] md:h-[220px] bg-linen" />
              <div className="p-6 space-y-3">
                <div className="h-6 w-1/2 rounded bg-linen" />
                <div className="h-3 w-full rounded bg-linen" />
                <div className="h-3 w-5/6 rounded bg-linen" />
              </div>
            </div>
          ))
        : items.map((w) => {
            const slides = toSlides(w);
            return (
              <article
                key={w.id}
                className="card-hover bg-card border border-border rounded-lg overflow-hidden flex flex-col"
              >
                {slides.length > 0 ? (
                  <ProductCarousel slides={slides} />
                ) : w.cover_image ? (
                  <div className="aspect-[4/3] bg-linen overflow-hidden">
                    <img
                      src={w.cover_image}
                      alt={w.title}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-display text-2xl text-ink">{w.title}</h3>
                  <p className="text-sm text-ink/75 mt-3 leading-relaxed whitespace-pre-line">
                    {w.description}
                  </p>
                </div>
              </article>
            );
          })}
    </div>
  );
}
