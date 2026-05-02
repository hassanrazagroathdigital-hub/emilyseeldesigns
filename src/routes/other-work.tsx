import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { FolkDivider } from "@/components/FolkDivider";

import ow1 from "@/assets/ow-1.jpg";
import ow2 from "@/assets/ow-2.jpg";
import ow3 from "@/assets/ow-3.jpg";
import ow4 from "@/assets/ow-4.jpg";
import ow5 from "@/assets/ow-5.jpg";
import ow6 from "@/assets/ow-6.jpg";
import ow7 from "@/assets/ow-7.jpg";
import ow8 from "@/assets/ow-8.jpg";
import ow9 from "@/assets/ow-9.jpg";

const images = [ow1, ow2, ow3, ow4, ow5, ow6, ow7, ow8, ow9];

export const Route = createFileRoute("/other-work")({
  head: () => ({
    meta: [
      { title: "Other Work — Emily Seel Designs" },
      {
        name: "description",
        content:
          "A decade of creative making across mosaic art, acrylic painting, ceramics, and woodwork by Emily Seel.",
      },
      { property: "og:title", content: "Other Work — Emily Seel Designs" },
      {
        property: "og:description",
        content:
          "Mosaic, paint, clay, and wood — a full creative life of original handmade pieces.",
      },
      { property: "og:image", content: ow1 },
      { name: "twitter:image", content: ow1 },
    ],
  }),
  component: OtherWorkPage,
});

function OtherWorkPage() {
  return (
    <PageShell>
      <PageHeader
        title="Other Work"
        subtitle="A full creative life — in mosaic, paint, clay, and wood."
        intro="Emily's creative practice extends far beyond any single medium. This section showcases a decade of making across mosaic art, acrylic painting, ceramics, woodwork, and garden installations. Every piece is an original."
      />

      <div className="py-16 md:py-20 bg-cream">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          <div className="columns-2 md:columns-3 gap-0 [&>img]:w-full [&>img]:mb-0 [&>img]:block">
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                loading="lazy"
                className="break-inside-avoid"
              />
            ))}
          </div>
        </div>
      </div>

      <FolkDivider />

      <section className="bg-linen py-24 md:py-32">
        <div className="max-w-[820px] mx-auto px-6 lg:px-10 text-center">
          <p className="font-display italic text-ink text-3xl md:text-4xl leading-snug">
            “Creativity is not a single discipline. It is a practice, a habit, a way of seeing the
            world.”
          </p>
        </div>
      </section>
    </PageShell>
  );
}
