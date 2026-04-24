import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { FolkDivider } from "@/components/FolkDivider";
import { GalleryGroup } from "@/components/GalleryGroup";

import lovey1 from "@/assets/lovey-lion.jpg";
import lovey2 from "@/assets/lovey-bunny.jpg";
import lovey3 from "@/assets/lovey-penguin.jpg";
import lovey4 from "@/assets/lovey-reindeer.jpg";
import lovey5 from "@/assets/lovey-bear.jpg";
import quiltA from "@/assets/quilt-pinwheel.jpg";
import quiltB from "@/assets/quilt-woodland.jpg";
import quiltC from "@/assets/quilt-abc.jpg";
import quiltD from "@/assets/quilt-striped.jpg";
import quiltE from "@/assets/quilt-giraffe.jpg";
import apron1 from "@/assets/apron-floral.jpg";
import apron2 from "@/assets/apron-holiday.jpg";
import apron3 from "@/assets/apron-paisley.jpg";

export const Route = createFileRoute("/soft-goods")({
  head: () => ({
    meta: [
      { title: "Soft Goods — Emily Seel Designs" },
      {
        name: "description",
        content:
          "Handmade baby loveys, patchwork quilts, blankets, and children's aprons sewn with care by Emily Seel in Portland, Oregon.",
      },
      { property: "og:title", content: "Soft Goods — Emily Seel Designs" },
      {
        property: "og:description",
        content:
          "Sewn with care. Made to be cherished. A handmade collection of loveys, quilts, blankets, and aprons.",
      },
      { property: "og:image", content: quiltA },
      { name: "twitter:image", content: quiltA },
    ],
  }),
  component: SoftGoodsPage,
});

function SoftGoodsPage() {
  return (
    <PageShell>
      <PageHeader
        title="Soft Goods"
        subtitle="Sewn with care. Made to be cherished."
        intro="This collection of handmade soft goods represents years of sewing with intention. From baby loveys and patchwork quilts to matching aprons for mama and mini, every piece is sewn by hand and made to last through years of use and love."
      />

      <div className="py-16 md:py-20 bg-cream">
        <GalleryGroup
          label="Baby Loveys and Comfort Items"
          items={[
            { src: lovey1, caption: "Lion lovey — soft satin blanket body" },
            { src: lovey2, caption: "Bunny lovey — pastel cotton" },
            { src: lovey3, caption: "Penguin lovey — knit comfort" },
            { src: lovey4, caption: "Reindeer lovey — plaid blanket" },
            { src: lovey5, caption: "Bear lovey — knit cotton" },
          ]}
        />
        <GalleryGroup
          label="Quilts and Blankets"
          items={[
            { src: quiltA, caption: "Pinwheel patchwork quilt" },
            { src: quiltB, caption: "Woodland animal nursery quilt" },
            { src: quiltC, caption: "ABC and number patchwork blanket" },
            { src: quiltD, caption: "Striped and plaid receiving blanket" },
            { src: quiltE, caption: "Giraffe and panda baby blanket" },
          ]}
        />
        <GalleryGroup
          label="Aprons"
          items={[
            { src: apron1, caption: "Bold floral cross-back apron" },
            { src: apron2, caption: "Holiday print ruffled apron" },
            { src: apron3, caption: "Paisley mama and mini set" },
          ]}
        />
      </div>

      <FolkDivider />

      {/* CTA BAND */}
      <section className="bg-navy py-20 md:py-24">
        <div className="max-w-[800px] mx-auto px-6 lg:px-10 text-center">
          <h2 className="font-display italic text-cream text-4xl md:text-5xl">
            Interested in a custom piece?
          </h2>
          <p className="mt-5 text-cream/80">
            Every item Emily makes can be customized to your fabric, colors, and sizing
            preferences. Reach out to start a conversation.
          </p>
          <div className="mt-8">
            <Link to="/contact" className="btn-primary">get in touch</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
