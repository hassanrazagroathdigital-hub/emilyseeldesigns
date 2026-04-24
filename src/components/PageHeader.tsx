import { FolkDivider } from "./FolkDivider";

export function PageHeader({
  title,
  subtitle,
  intro,
}: {
  title: string;
  subtitle?: string;
  intro?: string;
}) {
  return (
    <>
      <section className="bg-cream pt-16 pb-14 md:pt-24 md:pb-16">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 text-center rise-in">
          <h1 className="font-display text-terracotta text-5xl md:text-6xl">{title}</h1>
          {subtitle && (
            <p className="mt-4 font-display italic text-xl md:text-2xl text-ink/70">
              {subtitle}
            </p>
          )}
          {intro && (
            <p className="mt-6 max-w-[640px] mx-auto text-ink/80">{intro}</p>
          )}
        </div>
      </section>
      <FolkDivider />
    </>
  );
}
