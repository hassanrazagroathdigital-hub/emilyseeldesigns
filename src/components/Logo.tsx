import { Link } from "react-router-dom";
import { useSiteSettings } from "@/lib/cms/public";

export function Logo({ tone = "ink" }: { tone?: "ink" | "cream" }) {
  const { general } = useSiteSettings();
  return (
    <Link to="/" className="inline-flex items-center group" aria-label={general.siteName}>
      <img
        src={general.logoUrl}
        alt={general.siteName}
        className={`h-12 sm:h-14 w-auto object-contain group-hover:opacity-80 transition-opacity ${
          tone === "cream" ? "brightness-0 invert" : ""
        }`}
      />
    </Link>
  );
}
