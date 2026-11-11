import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  FolderKanban,
  Image as ImageIcon,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { adminKeys, fetchStats } from "@/lib/cms/admin";
import { useSiteSettings } from "@/lib/cms/public";
import { cn } from "@/lib/utils";
import { useAuth } from "./auth";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/galleries", label: "Galleries", icon: Images },
  { to: "/admin/inquiries", label: "Inquiries", icon: Mail, badge: "unread" as const },
  { to: "/admin/media", label: "Media Library", icon: ImageIcon },
  { to: "/admin/settings", label: "Website Settings", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const auth = useAuth();
  const { general } = useSiteSettings();
  const stats = useQuery({
    queryKey: adminKeys.stats,
    queryFn: fetchStats,
    refetchInterval: 60_000,
  });
  const unread = stats.data?.inquiries_unread ?? 0;
  const email = auth.status === "signed-in" ? auth.session.user.email : "";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <img src={general.logoUrl} alt="" className="h-9 w-auto max-w-[120px] object-contain" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{general.siteName}</p>
          <p className="text-xs text-muted-foreground">Content manager</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-terracotta/10 text-terracotta"
                  : "text-ink/75 hover:bg-linen hover:text-ink",
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.badge === "unread" && unread > 0 && (
              <span className="rounded-full bg-terracotta px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border px-3 py-4">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink/75 hover:bg-linen hover:text-ink"
        >
          <ExternalLink className="h-4 w-4" />
          View website
        </a>
        <button
          type="button"
          onClick={() => void auth.signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-ink/75 hover:bg-linen hover:text-ink"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
        {email && <p className="truncate px-3 pt-2 text-xs text-muted-foreground">{email}</p>}
      </div>
    </div>
  );
}

export function AdminShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const current = NAV.find((n) =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to),
  );

  return (
    <div className="min-h-screen bg-cream font-sans text-ink">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card/95 px-4 backdrop-blur lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="!size-5" />
        </Button>
        <span className="text-sm font-semibold">{current?.label ?? "Admin"}</span>
      </header>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
