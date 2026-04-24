const ITEMS = [
  "Industrial Design",
  "Soft Goods",
  "Fine Art",
  "Portland Oregon",
  "Handmade",
  "One of a Kind",
  "Emily Seel Designs",
  "Children's Products",
  "Mosaic",
  "Sewing",
  "Carpentry",
  "Ceramics",
];

export function Marquee() {
  const row = (
    <div className="flex shrink-0 items-center gap-10 pr-10">
      {ITEMS.map((t, i) => (
        <span
          key={i}
          className="nav-link text-cream/85 flex items-center gap-10"
        >
          {t}
          <span className="text-terracotta" aria-hidden="true">·</span>
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
