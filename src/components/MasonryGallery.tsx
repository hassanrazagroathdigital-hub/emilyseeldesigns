import { usePublicGallery } from "@/lib/cms/public";
import type { GalleryCollection } from "@/lib/cms/types";

const SKELETON_HEIGHTS = [260, 340, 220, 300, 380, 240];

/** Soft Goods / Other Work masonry image wall. */
export function MasonryGallery({ collection }: { collection: GalleryCollection }) {
  const { items, loading } = usePublicGallery(collection);

  return (
    <div className="py-16 md:py-20 bg-cream">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
        {loading ? (
          <div className="columns-2 md:columns-3 gap-0" aria-hidden="true">
            {SKELETON_HEIGHTS.map((h, i) => (
              <div
                key={i}
                className="break-inside-avoid bg-linen animate-pulse border border-cream"
                style={{ height: h }}
              />
            ))}
          </div>
        ) : (
          <div className="columns-2 md:columns-3 gap-0 [&>img]:w-full [&>img]:mb-0 [&>img]:block">
            {items.map((img) => (
              <img
                key={img.id}
                src={img.image_url}
                alt={img.alt}
                title={img.caption || undefined}
                loading="lazy"
                className="break-inside-avoid"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
