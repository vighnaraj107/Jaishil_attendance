import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AppShell } from "./app-shell-w1OeyTXz.mjs";
import { m as mappingRules, c as contractors } from "./mock-data-CVfYmLt4.mjs";
import { W as WandSparkles, A as ArrowRight, P as Plus, T as Trash2, b as Building2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./router-B1wZEgDi.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
function MappingsPage() {
  const [rules, setRules] = reactExports.useState(mappingRules);
  const [contractors$1, setContractors] = reactExports.useState(contractors);
  const [raw, setRaw] = reactExports.useState("");
  const [canonical, setCanonical] = reactExports.useState("");
  const [newContractor, setNewContractor] = reactExports.useState("");
  const addRule = () => {
    if (!raw || !canonical) return;
    setRules((r) => [{
      id: crypto.randomUUID(),
      raw,
      canonical,
      scope: "contractor"
    }, ...r]);
    setRaw("");
    setCanonical("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 max-w-[1200px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-[0.18em] text-[color:var(--emerald-brand)] font-semibold mb-2", children: "Normalization" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-display font-semibold", children: "Fuzzy Matching & Mapping Rules" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Teach the OCR pipeline to fix recurring misreads." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-elevated rounded-2xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "size-5 text-[color:var(--emerald-brand)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Manual OCR Fixes" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-3 items-center mb-6 p-4 rounded-xl bg-secondary/50 border border-dashed border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: raw, onChange: (e) => setRaw(e.target.value), placeholder: "Raw OCR text (e.g. Anish Grp)", className: "px-4 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-[color:var(--navy)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4 text-muted-foreground mx-auto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: canonical, onChange: (e) => setCanonical(e.target.value), placeholder: "Canonical name (e.g. Ansh)", className: "px-4 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-[color:var(--navy)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: addRule, className: "px-4 py-2.5 rounded-lg gradient-emerald text-[color:var(--success-foreground)] text-sm font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
          " Add"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl overflow-hidden border border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-secondary text-secondary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider", children: "Raw OCR" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider", children: "Canonical" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider", children: "Scope" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 w-12" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rules.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border hover:bg-accent/30 transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs text-muted-foreground", children: r.raw }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: r.canonical }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${r.scope === "contractor" ? "bg-[color:var(--navy)]/12 text-[color:var(--navy)]" : "bg-[color:var(--teal-brand)]/15 text-[color:var(--teal-brand)]"}`, children: r.scope }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRules((p) => p.filter((x) => x.id !== r.id)), className: "size-8 grid place-items-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) }) })
        ] }, r.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-elevated rounded-2xl p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "size-5 text-[color:var(--navy)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Canonical Contractors" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: contractors$1.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border hover:border-[color:var(--navy)]/40 hover:bg-accent/30 transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-9 rounded-lg grid place-items-center font-display font-bold text-white text-sm shrink-0", style: {
            background: c.color
          }, children: c.name[0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: c.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
              c.employees,
              " employees"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setContractors((p) => p.filter((x) => x.id !== c.id)), className: "size-8 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
      ] }, c.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: newContractor, onChange: (e) => setNewContractor(e.target.value), placeholder: "Add new contractor name", className: "flex-1 px-4 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-[color:var(--navy)]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          if (!newContractor) return;
          setContractors((p) => [...p, {
            id: crypto.randomUUID(),
            name: newContractor,
            employees: 0,
            color: "var(--slate-cool)"
          }]);
          setNewContractor("");
        }, className: "px-4 py-2.5 rounded-lg gradient-navy text-white text-sm font-semibold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
          " Add Contractor"
        ] })
      ] })
    ] })
  ] }) });
}
export {
  MappingsPage as component
};
