import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Instagram, Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const links = [
  { to: "/" as const, label: "Home" },
  { to: "/" as const, label: "Industrial Design" },
  { to: "/soft-goods" as const, label: "Soft Goods" },
  { to: "/other-work" as const, label: "Other Work" },
  { to: "/contact" as const, label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/95 backdrop-blur-sm shadow-[0_1px_0_0_var(--color-border)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-6">
        <Logo />

        <nav className="hidden lg:flex items-center gap-9">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="nav-link text-ink/80 hover:text-terracotta transition-colors"
              activeProps={{ className: "nav-link text-terracotta" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4 text-ink/70">
          <a
            href="mailto:hello@emilyseeldesigns.com"
            aria-label="Email"
            className="hover:text-terracotta transition-colors"
          >
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

        <button
          aria-label="Open menu"
          className="lg:hidden p-2 text-ink"
          onClick={() => setOpen(true)}
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile slide-in */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute top-0 right-0 h-full w-[78%] max-w-sm bg-cream shadow-2xl p-6 flex flex-col transition-transform ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between mb-10">
            <Logo />
            <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-2">
              <X size={22} />
            </button>
          </div>
          <nav className="flex flex-col gap-5">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="font-display text-2xl text-ink hover:text-terracotta"
                activeProps={{ className: "font-display text-2xl text-terracotta" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex items-center gap-4 text-ink/70 pt-8 border-t border-border">
            <a href="mailto:hello@emilyseeldesigns.com" aria-label="Email"><Mail size={18} /></a>
            <a href="https://instagram.com/emilyseeldesigns" aria-label="Instagram" target="_blank" rel="noreferrer"><Instagram size={18} /></a>
            <span className="eyebrow ml-auto">hello@emilyseeldesigns.com</span>
          </div>
        </aside>
      </div>
    </header>
  );
}
