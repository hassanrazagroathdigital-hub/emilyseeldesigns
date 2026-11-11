import { useSiteSettings } from "@/lib/cms/public";

export function Marquee() {
  const { marquee } = useSiteSettings();
  const items = marquee.items.filter((t) => t.trim());
  if (items.length === 0) return null;

  const row = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((t, i) => (
        <span key={i} className="nav-link text-cream/85 flex items-center gap-10">
          {t}
          <span className="text-terracotta" aria-hidden="true">
            ·
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="bg-navy py-4 overflow-hidden">
      <div className="marquee-track">
        {row}
        {row}
      </div>
    </div>
  );
}
