import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { FolkDivider } from "@/components/FolkDivider";
import { ProjectGrid } from "@/components/ProjectGrid";
import { useSiteSettings } from "@/lib/cms/public";

export default function IndustrialDesignPage() {
  const { industrial_design: page, seo } = useSiteSettings();
  useDocumentTitle(seo.industrialDesignTitle, seo.industrialDesignDescription);

  return (
    <PageShell>
      <PageHeader title={page.title} subtitle={page.subtitle} />

      <section className="py-16 md:py-20 bg-cream">
        <ProjectGrid />
      </section>

      <FolkDivider />
    </PageShell>
  );
}
