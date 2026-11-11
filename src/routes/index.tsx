import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/lib/useDocumentTitle";
import { PageShell } from "@/components/PageShell";
import { FolkDivider } from "@/components/FolkDivider";
import { Marquee } from "@/components/Marquee";
import { ProjectGrid } from "@/components/ProjectGrid";
import { useSiteSettings } from "@/lib/cms/public";

export default function HomePageDefault() {
  const { seo } = useSiteSettings();
  useDocumentTitle(seo.homeTitle, seo.homeDescription);
  return <HomePage />;
}

function displayHost(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function HomePage() {
  const { home, featured } = useSiteSettings();
  return (
    <PageShell>
      {/* HERO */}
      <section className="bg-cream">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-0 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="rise-in">
            <span className="eyebrow">{home.heroEyebrow}</span>
            <h1 className="font-display text-ink text-5xl sm:text-6xl md:text-7xl mt-5 leading-[1.05]">
              {home.heroTitleLine1} <br />
              {home.heroTitleLine2}{" "}
              <em className="text-terracotta not-italic font-display">{home.heroTitleEmphasis}</em>
            </h1>
            <p className="mt-7 max-w-[520px] text-ink/80 whitespace-pre-line">{home.heroIntro}</p>
            {home.heroCtaLabel && (
              <div className="mt-9">
                <a href="#work" className="btn-primary">
                  {home.heroCtaLabel}
                </a>
              </div>
            )}
          </div>
          <div className="relative rise-in">
            <div className="aspect-[4/5]">
              <img
                src={home.heroImage}
                alt={home.heroImageAlt}
                width={1280}
                height={1280}
                className="w-full h-full object-contain"
              />
            </div>
            <div
              className="absolute -bottom-4 -left-4 hidden md:block w-28 h-28 rounded-full border-2 border-dashed border-terracotta/60"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <FolkDivider />
      <Marquee />
      <FolkDivider />

      {/* WORK */}
      <section id="work" className="py-20 md:py-28 bg-cream">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 text-center mb-14">
          <h2 className="font-display text-ink text-4xl md:text-5xl">{home.workTitle}</h2>
          <p className="mt-3 font-display italic text-ink/65 text-lg">{home.workSubtitle}</p>
        </div>

        <ProjectGrid featuredOnly />
      </section>

      <FolkDivider />

      {/* ABOUT STRIP */}
      <section className="bg-linen py-20 md:py-28">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border-[6px] border-terracotta/20 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]">
              <img
                src={home.aboutImage}
                alt="Portrait of Emily Seel in her studio"
                loading="lazy"
                width={1024}
                height={1280}
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-terracotta/15 border border-terracotta/30 hidden md:block"
              aria-hidden="true"
            />
          </div>
          <div>
            <span className="eyebrow">{home.aboutEyebrow}</span>
            <h2 className="font-display italic text-ink text-4xl md:text-5xl mt-3">
              {home.aboutTitle}
            </h2>
            <p className="mt-6 text-ink/80 whitespace-pre-line">{home.aboutBody}</p>
            {home.aboutCtaLabel && (
              <div className="mt-8">
                <Link to="/contact" className="btn-primary">
                  {home.aboutCtaLabel}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <FolkDivider />

      {/* DISCIPLINES TEASER */}
      {featured.enabled && featured.url && (
        <>
          <section className="bg-cream py-20 md:py-28">
            <div className="max-w-[1100px] mx-auto px-6 lg:px-10 text-center mb-14">
              <h2 className="font-display text-ink text-4xl md:text-5xl">{home.moreTitle}</h2>
              <p className="mt-3 font-display italic text-ink/65 text-lg">{home.moreSubtitle}</p>
            </div>

            <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
              <a
                href={featured.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-hover group block rounded-2xl overflow-hidden border border-border bg-linen"
              >
                <div className="grid md:grid-cols-2 gap-0 items-stretch">
                  <div className="relative bg-ink/5 p-6 md:p-8 flex items-center justify-center">
                    <div className="w-full rounded-lg overflow-hidden border border-border shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)] bg-cream">
                      <div className="flex items-center gap-1.5 px-3 py-2 bg-ink/90 border-b border-border">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                        <span className="ml-3 text-[11px] text-cream/70 font-mono truncate">
                          {displayHost(featured.url)}
                        </span>
                      </div>
                      <div className="aspect-[16/10] bg-cream">
                        <iframe
                          src={featured.url}
                          title={`${featured.title} preview`}
                          loading="lazy"
                          className="w-full h-full border-0 pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <span className="eyebrow">{featured.eyebrow}</span>
                    <h3 className="font-display text-ink text-3xl md:text-4xl mt-3">
                      {featured.title}
                    </h3>
                    <p className="font-display italic text-ink/65 text-lg mt-2">
                      {featured.subtitle}
                    </p>
                    <p className="text-ink/80 mt-5 text-sm leading-relaxed">{featured.body}</p>
                    <span className="btn-primary mt-7 self-start inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                      {featured.ctaLabel} <span aria-hidden="true">→</span>
                    </span>
                  </div>
                </div>
              </a>
            </div>
          </section>

          <FolkDivider />
        </>
      )}
    </PageShell>
  );
}
