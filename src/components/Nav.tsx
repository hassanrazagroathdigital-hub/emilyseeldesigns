import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Mail, Instagram, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { useSiteSettings } from "@/lib/cms/public";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { navigation, contact } = useSiteSettings();

  const links = [
    { to: "/", label: navigation.home, end: true },
    { to: "/industrial-design", label: navigation.industrialDesign, end: false },
    { to: "/soft-goods", label: navigation.softGoods, end: false },
    { to: "/other-work", label: navigation.otherWork, end: false },
    { to: "/contact", label: navigation.contact, end: false },
  ];

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
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `nav-link transition-colors ${isActive ? "text-terracotta" : "text-ink/80 hover:text-terracotta"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4 text-ink/70">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              aria-label="Email"
              className="hover:text-terracotta transition-colors"
            >
              <Mail size={18} />
            </a>
          )}
          {contact.instagramUrl && (
            <a
              href={contact.instagramUrl}
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
              className="hover:text-terracotta transition-colors"
            >
              <Instagram size={18} />
            </a>
          )}
        </div>

        <button
          aria-label="Open menu"
          className="lg:hidden p-2 text-ink"
          onClick={() => setOpen(true)}
        >
          <Menu size={22} />
        </button>
      </div>

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
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `font-display text-2xl ${isActive ? "text-terracotta" : "text-ink hover:text-terracotta"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto flex items-center gap-4 text-ink/70 pt-8 border-t border-border">
            {contact.email && (
              <a href={`mailto:${contact.email}`} aria-label="Email">
                <Mail size={18} />
              </a>
            )}
            {contact.instagramUrl && (
              <a
                href={contact.instagramUrl}
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram size={18} />
              </a>
            )}
            <span className="eyebrow ml-auto">{contact.email}</span>
          </div>
        </aside>
      </div>
    </header>
  );
}

// Silence unused-import lint in case some compilers flag bare Link import
export { Link };
