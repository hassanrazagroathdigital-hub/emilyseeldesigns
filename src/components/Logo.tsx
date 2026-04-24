import { Link } from "@tanstack/react-router";

export function Logo({ tone = "ink" }: { tone?: "ink" | "cream" }) {
  const top = tone === "cream" ? "text-cream" : "text-ink";
  const script = "text-terracotta";
  return (
    <Link to="/" className="inline-flex flex-col leading-none -space-y-1 group">
      <span
        className={`font-display tracking-tight text-[22px] sm:text-[26px] ${top} group-hover:opacity-80 transition-opacity`}
      >
        Emily Seel
      </span>
      <span
        className={`font-script ${script} text-[26px] sm:text-[30px] -mt-2 ml-8`}
        aria-hidden="true"
      >
        Designs
      </span>
    </Link>
  );
}
