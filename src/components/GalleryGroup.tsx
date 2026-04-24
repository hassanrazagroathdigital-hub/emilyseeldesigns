export type GalleryItem = { src: string; caption: string };

export function GalleryGroup({
  label,
  items,
}: {
  label: string;
  items: GalleryItem[];
}) {
  return (
    <section className="max-w-[1100px] mx-auto px-6 lg:px-10 mb-16">
      <h3 className="eyebrow mb-6">{label}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <figure
            key={i}
            className="card-hover bg-card border border-border rounded-lg overflow-hidden"
          >
            <div className="aspect-[4/5] overflow-hidden bg-linen">
              <img
                src={item.src}
                alt={item.caption}
                loading="lazy"
                width={1024}
                height={1024}
                className="w-full h-full object-cover"
              />
            </div>
            <figcaption className="px-4 py-3 text-xs text-muted-foreground italic font-display">
              {item.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
