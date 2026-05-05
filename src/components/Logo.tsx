import { Link } from "@tanstack/react-router";
import logo from "@/assets/emily-seel-designs-logo.png";

export function Logo({ tone = "ink" }: { tone?: "ink" | "cream" }) {
  return (
    <Link to="/" className="inline-flex items-center group" aria-label="Emily Seel Designs">
      <img
        src={logo}
        alt="Emily Seel Designs"
        className={`h-12 sm:h-14 w-auto object-contain group-hover:opacity-80 transition-opacity ${
          tone === "cream" ? "brightness-0 invert" : ""
        }`}
      />
    </Link>
  );
}
