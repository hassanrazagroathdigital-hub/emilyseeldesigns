import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { FolkDivider } from "@/components/FolkDivider";
import { MasonryGallery } from "@/components/MasonryGallery";
import { useSiteSettings } from "@/lib/cms/public";

export default function SoftGoodsPage() {
  const { soft_goods: page, seo } = useSiteSettings();
  useDocumentTitle(seo.softGoodsTitle, seo.softGoodsDescription);
  return (
    <PageShell>
      <PageHeader title={page.title} subtitle={page.subtitle} intro={page.intro} />

      <MasonryGallery collection="soft-goods" />

      <FolkDivider />

      {/* CTA BAND */}
      <section className="bg-navy py-20 md:py-24">
        <div className="max-w-[800px] mx-auto px-6 lg:px-10 text-center">
          <h2 className="font-display italic text-cream text-4xl md:text-5xl">{page.ctaTitle}</h2>
          <p className="mt-5 text-cream/80">{page.ctaBody}</p>
          {page.ctaLabel && (
            <div className="mt-8">
              <Link to="/contact" className="btn-primary">
                {page.ctaLabel}
              </Link>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
