import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useTheme } from "./router-B1wZEgDi.mjs";
import { k as ScanLine, l as Sparkles, m as LayoutDashboard, n as Table2, W as WandSparkles, o as Settings, c as Sun, M as Moon } from "../_libs/lucide-react.mjs";
const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/attendance", label: "Attendance Grid", icon: Table2 },
  { to: "/mappings", label: "Mapping Rules", icon: WandSparkles },
  { to: "/settings", label: "Settings", icon: Settings }
];
function AppShell({ children }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, toggle } = useTheme();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "w-64 shrink-0 hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-6 flex items-center gap-3 border-b border-sidebar-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl gradient-emerald grid place-items-center shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ScanLine, { className: "size-5 text-[color:var(--success-foreground)]" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-semibold tracking-tight text-base leading-tight", children: "Attendance" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-sidebar-foreground/60 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3" }),
            " AI-powered OCR"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 px-3 py-4 space-y-1", children: nav.map((n) => {
        const active = pathname === n.to;
        const Icon = n.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: n.to,
            className: `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `size-4 ${active ? "text-[color:var(--sidebar-primary)]" : ""}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: n.label }),
              active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto size-1.5 rounded-full bg-[color:var(--sidebar-primary)]" })
            ]
          },
          n.to
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-4 border-t border-sidebar-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-3 bg-sidebar-accent/40 text-xs text-sidebar-foreground/80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-sidebar-foreground mb-1", children: "Claude Vision · v3.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sidebar-foreground/60", children: "Connected · Online" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "h-16 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-30 flex items-center px-6 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Workspace" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium", children: "Contractor Attendance — May 2026" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: toggle,
            className: "size-10 grid place-items-center rounded-lg border border-border hover:bg-accent transition-colors",
            "aria-label": "Toggle theme",
            children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "size-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-full gradient-navy grid place-items-center text-white text-sm font-semibold", children: "AD" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 p-6 lg:p-8", children })
    ] })
  ] });
}
export {
  AppShell as A
};
