import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { FolkDivider } from "@/components/FolkDivider";

import sg1 from "@/assets/sg-1.jpg";
import sg2 from "@/assets/sg-2.jpg";
import sg3 from "@/assets/sg-3.jpg";
import sg4 from "@/assets/sg-4.jpg";
import sg5 from "@/assets/sg-5.jpg";
import sg6 from "@/assets/sg-6.jpg";
import sg7 from "@/assets/sg-7.jpg";
import sg8 from "@/assets/sg-8.jpg";
import sg9 from "@/assets/sg-9.jpg";
import sg10 from "@/assets/sg-10.jpg";
import sg11 from "@/assets/sg-11.jpg";
import sg12 from "@/assets/sg-12.jpg";
import sg13 from "@/assets/sg-13.jpg";
import sg14 from "@/assets/sg-14.jpg";
import sg15 from "@/assets/sg-15.jpg";
import sg16 from "@/assets/sg-16.jpg";
import sg17 from "@/assets/sg-17.jpg";
import sg18 from "@/assets/sg-18.jpg";
import sg19 from "@/assets/sg-19.jpg";
import sg20 from "@/assets/sg-20.jpg";

const images = [sg1, sg2, sg3, sg4, sg5, sg6, sg7, sg8, sg9, sg10, sg11, sg12, sg13, sg14, sg15, sg16, sg17, sg18, sg19, sg20];

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
      { property: "og:image", content: sg1 },
      { name: "twitter:image", content: sg1 },
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
