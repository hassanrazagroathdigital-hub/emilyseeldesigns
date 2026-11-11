import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { FolkDivider } from "@/components/FolkDivider";
import { MasonryGallery } from "@/components/MasonryGallery";
import { useSiteSettings } from "@/lib/cms/public";

export default function OtherWorkPage() {
  const { other_work: page, seo } = useSiteSettings();
  useDocumentTitle(seo.otherWorkTitle, seo.otherWorkDescription);
  return (
    <PageShell>
      <PageHeader title={page.title} subtitle={page.subtitle} intro={page.intro} />

      <MasonryGallery collection="other-work" />

      <FolkDivider />

      {page.quote && (
        <section className="bg-linen py-24 md:py-32">
          <div className="max-w-[820px] mx-auto px-6 lg:px-10 text-center">
            <p className="font-display italic text-ink text-3xl md:text-4xl leading-snug">
              {page.quote}
            </p>
          </div>
        </section>
      )}
    </PageShell>
  );
}
