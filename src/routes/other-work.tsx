import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { FolkDivider } from "@/components/FolkDivider";
import { GalleryGroup } from "@/components/GalleryGroup";

import m1 from "@/assets/mosaic-plate.jpg";
import m2 from "@/assets/mosaic-stepping.jpg";
import m3 from "@/assets/mosaic-path.jpg";
import m4 from "@/assets/mosaic-coasters.jpg";
import m5 from "@/assets/mosaic-radial.jpg";
import p1 from "@/assets/painting-abstract.jpg";
import p2 from "@/assets/painting-robin.jpg";
import p3 from "@/assets/painting-nature.jpg";
import c1 from "@/assets/mug-fox.jpg";
import c2 from "@/assets/mug-botanical.jpg";
import c3 from "@/assets/mug-bird.jpg";
import w1 from "@/assets/wood-birdhouse.jpg";
import w2 from "@/assets/wood-abc.jpg";
import w3 from "@/assets/wood-garden.jpg";

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
      { property: "og:image", content: m1 },
      { name: "twitter:image", content: m1 },
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
        <GalleryGroup
          label="Mosaic Work"
          items={[
            { src: m1, caption: "Floral mosaic plate" },
            { src: m2, caption: "Garden stepping stones" },
            { src: m3, caption: "Mosaic garden path" },
            { src: m4, caption: "Geometric tile coasters" },
            { src: m5, caption: "Radial mandala wall piece" },
          ]}
        />
        <GalleryGroup
          label="Paintings"
          items={[
            { src: p1, caption: "Acrylic pour on canvas" },
            { src: p2, caption: "Robin on a blossom branch" },
            { src: p3, caption: "Nature-inspired botanical abstract" },
          ]}
        />
        <GalleryGroup
          label="Ceramics and Mugs"
          items={[
            { src: c1, caption: "Hand-painted fox mug" },
            { src: c2, caption: "Botanical leaf mug" },
            { src: c3, caption: "Bird and branch mug" },
          ]}
        />
        <GalleryGroup
          label="Woodwork and Other"
          items={[
            { src: w1, caption: "Cedar shingle birdhouse" },
            { src: w2, caption: "ABC wooden block set" },
            { src: w3, caption: "Carved garden markers" },
          ]}
        />
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
