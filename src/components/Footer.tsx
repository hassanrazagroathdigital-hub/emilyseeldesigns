import { Link } from "@tanstack/react-router";
import { Mail, Instagram } from "lucide-react";
import { Logo } from "./Logo";

const links = [
  { to: "/" as const, label: "Industrial Design" },
  { to: "/soft-goods" as const, label: "Soft Goods" },
  { to: "/other-work" as const, label: "Other Work" },
  { to: "/contact" as const, label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-cream/85">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-16 grid gap-12 md:grid-cols-3">
        <div>
          <div className="[&_a]:!text-cream">
            <Logo tone="cream" />
          </div>
          <p className="font-display italic text-cream/80 mt-6 text-lg max-w-xs">
            Small-batch, big love. Handmade and one-of-a-kind.
          </p>
          <div className="flex items-center gap-4 mt-5 text-cream/70">
            <a href="mailto:hello@emilyseeldesigns.com" aria-label="Email" className="hover:text-terracotta transition-colors">
              <Mail size={18} />
            </a>
            <a
              href="https://instagram.com/emilyseeldesigns"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
              className="hover:text-terracotta transition-colors"
            >
              <Instagram size={18} />
            </a>
          </div>
        </div>

        <nav className="flex flex-col gap-3 md:items-center">
          <span className="eyebrow text-cream/55">Explore</span>
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-cream/85 hover:text-terracotta transition-colors text-sm"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="md:text-right">
          <span className="eyebrow text-cream/55">Get in touch</span>
          <p className="mt-3 text-cream/85">hello@emilyseeldesigns.com</p>
          <p className="text-cream/55 text-xs mt-6">
            © 2026 Emily Seel Designs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
