import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Table2, Wand2, Settings, ScanLine, Moon, Sun, Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { useTheme } from "@/lib/theme";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/attendance", label: "Attendance Grid", icon: Table2 },
  { to: "/mappings", label: "Mapping Rules", icon: Wand2 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-64 shrink-0 hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="px-5 py-6 flex items-center gap-3 border-b border-sidebar-border">
          <div className="size-10 rounded-xl gradient-emerald grid place-items-center shadow-lg">
            <ScanLine className="size-5 text-[color:var(--success-foreground)]" />
          </div>
          <div>
            <div className="font-display font-semibold tracking-tight text-base leading-tight">Attendance</div>
            <div className="text-xs text-sidebar-foreground/60 flex items-center gap-1">
              <Sparkles className="size-3" /> AI-powered OCR
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((n) => {
            const active = pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                }`}
              >
                <Icon className={`size-4 ${active ? "text-[color:var(--sidebar-primary)]" : ""}`} />
                <span className="font-medium">{n.label}</span>
                {active && <span className="ml-auto size-1.5 rounded-full bg-[color:var(--sidebar-primary)]" />}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-sidebar-border">
          <div className="rounded-xl p-3 bg-sidebar-accent/40 text-xs text-sidebar-foreground/80">
            <div className="font-medium text-sidebar-foreground mb-1">Claude Vision · v3.5</div>
            <div className="text-sidebar-foreground/60">Connected · Online</div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-30 flex items-center px-6 gap-4">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground">Workspace</div>
            <div className="text-sm font-medium">Contractor Attendance — May 2026</div>
          </div>
          <button
            onClick={toggle}
            className="size-10 grid place-items-center rounded-lg border border-border hover:bg-accent transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <div className="size-10 rounded-full gradient-navy grid place-items-center text-white text-sm font-semibold">
            AD
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
