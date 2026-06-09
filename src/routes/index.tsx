import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { FolkDivider } from "@/components/FolkDivider";
import { Marquee } from "@/components/Marquee";
import { ProductCarousel, type CarouselSlide } from "@/components/ProductCarousel";
import portrait from "@/assets/emily-portrait-magenta.jpg";
import patternBlocks from "@/assets/pattern-blocks.jpg";
import sandCity from "@/assets/sand-city.jpg";
import hideoutDesk from "@/assets/hideout-desk.jpg";
import scooplas from "@/assets/scooplas.jpg";
import myLittleRocket from "@/assets/my-little-rocket.jpg";
import shirtWings from "@/assets/shirt-wings.jpg";
import activityBoard from "@/assets/activity-board.jpg";
import ab1 from "@/assets/activity-board-1.jpg";
import ab2 from "@/assets/activity-board-2.jpg";
import ab3 from "@/assets/activity-board-3.jpg";
import ab4 from "@/assets/activity-board-4.jpg";
import ab5 from "@/assets/activity-board-5.jpg";
import ab6 from "@/assets/activity-board-6.jpg";
import pb1 from "@/assets/pattern-blocks-1.jpg";
import pb2 from "@/assets/pattern-blocks-2.jpg";
import pb3 from "@/assets/pattern-blocks-3.jpg";
import pb4 from "@/assets/pattern-blocks-4.jpg";
import sc1 from "@/assets/sand-city-1.jpg";
import sc2 from "@/assets/sand-city-2.jpg";
import sc3 from "@/assets/sand-city-3.jpg";
import sc4 from "@/assets/sand-city-4.jpg";
import hd1 from "@/assets/hideout-desk-1.jpg";
import hd2 from "@/assets/hideout-desk-2.jpg";
import hd3 from "@/assets/hideout-desk-3.jpg";
import hd4 from "@/assets/hideout-desk-4.jpg";
import sw1 from "@/assets/shirt-wings-1.jpg";
import sw2 from "@/assets/shirt-wings-2.jpg";
import sw3 from "@/assets/shirt-wings-3.jpg";
import sw4 from "@/assets/shirt-wings-4.jpg";
import sw5 from "@/assets/shirt-wings-5.jpg";
import mlr1 from "@/assets/my-little-rocket-1.jpg";
import mlr2 from "@/assets/my-little-rocket-2.jpg";
import mlr3 from "@/assets/my-little-rocket-3.jpg";
import mlr4 from "@/assets/my-little-rocket-4.jpg";
import sp1 from "@/assets/scooplas-1.jpg";
import sp2 from "@/assets/scooplas-2.jpg";
import sp3 from "@/assets/scooplas-3.jpg";
import sp4 from "@/assets/scooplas-4.jpg";

const patternBlocksSlides: CarouselSlide[] = [
  { src: pb3, alt: "Wooden geometric Pattern Blocks", fit: "cover" },
  { src: pb1, alt: "Pattern Blocks possible product line drawing", fit: "contain", enhance: true },
  { src: pb4, alt: "Pattern Blocks ideation sketches", fit: "contain", enhance: true },
  { src: pb2, alt: "Child playing with Pattern Blocks outdoors", fit: "cover" },
];

const sandCitySlides: CarouselSlide[] = [
  { src: sc4, alt: "Colorful Sand City molds stacked", fit: "cover" },
  { src: sc1, alt: "Sand City ideation sketches", fit: "contain", enhance: true },
  { src: sc2, alt: "Sand City possible product line drawing", fit: "contain", enhance: true },
  { src: sc3, alt: "Children playing with Sand City molds at the beach", fit: "cover" },
];

const hideoutDeskSlides: CarouselSlide[] = [
  { src: hd1, alt: "Hideout Desk with green shuttered legs outdoors", fit: "cover" },
  { src: hd2, alt: "Hideout Desk ideation sketches", fit: "contain", enhance: true },
  { src: hd3, alt: "Hideout Desk possible product line drawing", fit: "contain", enhance: true },
  { src: hd4, alt: "Child sitting at the Hideout Desk outdoors", fit: "cover", position: "top" },
];

const myLittleRocketSlides: CarouselSlide[] = [
  { src: mlr1, alt: "Cardboard My Little Rocket toy with red interior", fit: "cover" },
  { src: mlr2, alt: "My Little Rocket ideation sketches", fit: "contain", enhance: true },
  { src: mlr3, alt: "My Little Rocket in-use and product line drawing", fit: "contain", enhance: true },
  { src: mlr4, alt: "My Little Rocket possible product line drawing", fit: "contain", enhance: true },
];

const activityBoardSlides: CarouselSlide[] = [
  { src: ab1, alt: "Colorful Toddler Activity Board with rainbow elements", fit: "cover" },
  { src: ab2, alt: "Activity board with latches, buckles, locks, and gears", fit: "cover" },
  { src: ab3, alt: "Activity board with painted circles and sensory elements", fit: "cover" },
  { src: ab4, alt: "Activity board variation with mechanical elements", fit: "cover" },
  { src: ab5, alt: "Activity board variation with different arrangements", fit: "cover" },
  { src: ab6, alt: "Children playing with the activity board", fit: "cover", position: "top" },
];

const scooplasSlides: CarouselSlide[] = [
  { src: sp1, alt: "White rounded mitten-form Scooplas product", fit: "contain", bg: "#F0EBE3" },
  { src: sp2, alt: "Scooplas ideation sketches", fit: "contain", enhance: true },
  { src: sp3, alt: "Scooplas product line possibilities drawing", fit: "contain", enhance: true },
  { src: sp4, alt: "Child using Scooplas to scoop up toys", fit: "cover" },
];

const shirtWingsSlides: CarouselSlide[] = [
  { src: sw1, alt: "Wooden dragonfly-shaped Shirt Wings hanger", fit: "cover" },
  { src: sw2, alt: "Shirt Wings gear mechanism sketch", fit: "contain", enhance: true },
  { src: sw3, alt: "Shirt Wings how-it-works diagram", fit: "contain", enhance: true },
  { src: sw4, alt: "Shirt Wings possible product line drawing", fit: "contain", enhance: true },
  { src: sw5, alt: "Child using Shirt Wings hanger to hang a shirt", fit: "contain" },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Emily Seel Designs — Industrial Design Portfolio" },
      {
        name: "description",
        content:
          "Industrial designer and multidisciplinary maker based in Portland, Oregon. Thoughtful, handmade products for children — where craft meets intention.",
      },
      { property: "og:title", content: "Emily Seel Designs — Industrial Design Portfolio" },
      {
        property: "og:description",
        content:
          "Handmade products for children, designed and built with intention by Emily Seel in Portland, Oregon.",
      },
      { property: "og:image", content: pb3 },
      { name: "twitter:image", content: pb3 },
    ],
  }),
  component: IndustrialDesignPage,
});

type Work = {
  name: string;
  img: string;
  desc: string;
  slides?: CarouselSlide[];
};

const works: Work[] = [
  {
    name: "Pattern Blocks",
    img: patternBlocks,
    desc: "These classic wooden blocks are designed to have endless pattern possibilities. Each block has three different patterns and stained contrast to aid in pattern recognition and spatial recognition skills.",
    slides: patternBlocksSlides,
  },
  {
    name: "Sand City",
    img: sandCity,
    desc: "Sand City was inspired by sand castle molds. The market is so flooded with castle-themed sand toys, which are not relatable to children. Sand City enables children to make their own city at the beach with four unique city-building shaped molds.",
    slides: sandCitySlides,
  },
  {
    name: "Hideout Desk",
    img: hideoutDesk,
    desc: "Desk meets fort in this child's desk. Shutters attached to all legs create a great place to hide out. An overhang on one side allows the child to sit at the desk without damaging the shutter. Imaginative play has never been easier to foster.",
    slides: hideoutDeskSlides,
  },
  {
    name: "Scooplas",
    img: scooplas,
    desc: "The age-old problem of getting kids to pick up their toys just got a little easier. Scooplas are light, have easy-to-use mittens, and are flat on the bottom, making them very effective at scooping toys off the floor.",
    slides: scooplasSlides,
  },
  {
    name: "My Little Rocket",
    img: myLittleRocket,
    desc: "Ever noticed how the large box that something was packaged in is often more entertaining than the toy itself? With My Little Rocket, the box is the toy. It unfolds into a spaceship big enough for children to play in, with pop-out cardboard pieces that connect like puzzle pieces to create stackable alien creatures.",
    slides: myLittleRocketSlides,
  },
  {
    name: "Shirt Wings",
    img: shirtWings,
    desc: "Using conventional coat hangers is not easy for children. Shirt Wings are made with kids in mind. A gear mechanism allows the dragonfly-shaped wings to go up and down. When wings are down they fit in the neck of a shirt, then a pull of the hook raises them to hold the shirt in place, building independence and eye-hand coordination.",
    slides: shirtWingsSlides,
  },
  {
    name: "Toddler Activity Boards",
    img: activityBoard,
    desc: "These activity boards keep curious toddlers busy for hours. They are all cut to be interchangeable and fit an existing hanging system, so when children get bored with one, simply swap it out for another. Fine motor skills, color and shape matching, and number recognition are among the skills learned through play.",
    slides: activityBoardSlides,
  },
];

function IndustrialDesignPage() {
  return (
    <PageShell>
      {/* HERO */}
      <section className="bg-cream">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-0 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="rise-in">
            <span className="eyebrow">Industrial Design — Portfolio</span>
            <h1 className="font-display text-ink text-5xl sm:text-6xl md:text-7xl mt-5 leading-[1.05]">
              Where craft <br />
              meets <em className="text-terracotta not-italic font-display">intention.</em>
            </h1>
            <p className="mt-7 max-w-[520px] text-ink/80">
              Emily Seel is an Industrial Designer based in Portland, Oregon. She holds a Bachelor of
              Science in Industrial Design from The Art Institute of Seattle, where she focused on
              designing and building products for children. Every piece she creates is grounded in
              thoughtful problem-solving, tactile materials, and the belief that great design makes
              everyday life more joyful.
            </p>
            <div className="mt-9">
              <a href="#work" className="btn-primary">view the work</a>
            </div>
          </div>
          <div className="relative rise-in">
          <div className="aspect-[4/5]">
            <img
              src={pb3}
              alt="Wooden geometric Pattern Blocks"
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
          <h2 className="font-display text-ink text-4xl md:text-5xl">Industrial Design Work</h2>
          <p className="mt-3 font-display italic text-ink/65 text-lg">
            Designing for children. Building for life.
          </p>
        </div>

        <div className="max-w-[1280px] mx-auto px-6 lg:px-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((w) => (
            <article
              key={w.name}
              className="card-hover bg-card border border-border rounded-lg overflow-hidden flex flex-col"
            >
              {w.slides ? (
                <ProductCarousel slides={w.slides} />
              ) : (
                <div className="aspect-[4/3] bg-linen overflow-hidden">
                  <img
                    src={w.img}
                    alt={w.name}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-display text-2xl text-ink">{w.name}</h3>
                <p className="text-sm text-ink/75 mt-3 leading-relaxed">{w.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <FolkDivider />

      {/* ABOUT STRIP */}
      <section className="bg-linen py-20 md:py-28">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden border-[6px] border-terracotta/20 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)]">
              <img
                src={portrait}
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
            <span className="eyebrow">About</span>
            <h2 className="font-display italic text-ink text-4xl md:text-5xl mt-3">
              Hi, I am Emily.
            </h2>
            <p className="mt-6 text-ink/80">
              Emily Seel is a Cabinet Designer and multidisciplinary maker based out of Portland,
              Oregon. She completed her Bachelor of Science in Industrial Design from The Art
              Institute of Seattle, where she focused her studies on designing and building products
              for children. She enjoys all kinds of creative mediums, including sewing, painting,
              carpentry, and ceramics. Emily also has a passion for nature and loves houseplants and
              gardening.
            </p>
            <div className="mt-8">
              <Link to="/contact" className="btn-primary">get in touch</Link>
            </div>
          </div>
        </div>
      </section>

      <FolkDivider />

      {/* DISCIPLINES TEASER */}
      <section className="bg-cream py-20 md:py-28">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 text-center mb-14">
          <h2 className="font-display text-ink text-4xl md:text-5xl">More From Emily</h2>
          <p className="mt-3 font-display italic text-ink/65 text-lg">
            Beyond industrial design — a full creative practice.
          </p>
        </div>

        <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
          <a
            href="https://folk-pattern-forge.lovable.app/"
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
                      folk-pattern-forge.lovable.app
                    </span>
                  </div>
                  <div className="aspect-[16/10] bg-cream">
                    <iframe
                      src="https://folk-pattern-forge.lovable.app/"
                      title="Folk Pattern Forge preview"
                      loading="lazy"
                      className="w-full h-full border-0 pointer-events-none"
                    />
                  </div>
                </div>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="eyebrow">Featured Project</span>
                <h3 className="font-display text-ink text-3xl md:text-4xl mt-3">
                  Folk Pattern Forge
                </h3>
                <p className="font-display italic text-ink/65 text-lg mt-2">
                  Explore more of Emily's creative work
                </p>
                <p className="text-ink/80 mt-5 text-sm leading-relaxed">
                  A companion site exploring folk-inspired patterns, motifs, and design
                  experiments — another corner of Emily's creative practice.
                </p>
                <span className="btn-primary mt-7 self-start inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                  visit the site <span aria-hidden="true">→</span>
                </span>
              </div>
            </div>
          </a>
        </div>
      </section>

      <FolkDivider />
    </PageShell>
  );
}

