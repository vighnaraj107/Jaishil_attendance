import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AppShell } from "./app-shell-w1OeyTXz.mjs";
import { S as Server, B as Brain, C as Check, a as Save } from "../_libs/lucide-react.mjs";
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
const DEFAULT_PROMPT = `You are an OCR assistant. Extract attendance from the scanned sheet.
For each row, return JSON with: employee_name, contractor, shift (DAY/NIGHT),
and per-day entries with in_time, out_time, ot_hours. Use 24-hour HH:MM format.
Normalize handwriting variations using fuzzy matching against the canonical list.`;
function SettingsPage() {
  const [apiBase, setApiBase] = reactExports.useState("https://attendance-flask.onrender.com");
  const [model, setModel] = reactExports.useState("claude-3-5-sonnet-20250101");
  const [prompt, setPrompt] = reactExports.useState(DEFAULT_PROMPT);
  const [saved, setSaved] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const v = localStorage.getItem("apiBase");
    if (v) setApiBase(v);
  }, []);
  const save = () => {
    localStorage.setItem("apiBase", apiBase);
    localStorage.setItem("claudeModel", model);
    localStorage.setItem("ocrPrompt", prompt);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 max-w-[900px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-[0.18em] text-[color:var(--emerald-brand)] font-semibold mb-2", children: "Configuration" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-display font-semibold", children: "Settings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Connect the backend and tune the AI extraction pipeline." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Server, { className: "size-5 text-[color:var(--navy)]" }), title: "Backend API", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "API Base URL", hint: "Render Flask endpoint that handles uploads and storage.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: apiBase, onChange: (e) => setApiBase(e.target.value), className: "w-full px-4 py-2.5 rounded-lg border border-border bg-card font-mono text-sm outline-none focus:border-[color:var(--navy)]" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 mt-4", children: [{
        m: "POST",
        p: "/api/upload"
      }, {
        m: "GET",
        p: "/api/attendance"
      }, {
        m: "PUT",
        p: "/api/attendance/save"
      }, {
        m: "GET",
        p: "/api/files"
      }].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-secondary/30 font-mono text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-1.5 py-0.5 rounded text-[10px] font-bold ${r.m === "POST" ? "bg-[color:var(--emerald-brand)]/15 text-[color:var(--emerald-brand)]" : r.m === "PUT" ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)]" : "bg-[color:var(--navy)]/15 text-[color:var(--navy)]"}`, children: r.m }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: r.p })
      ] }, r.p)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "size-5 text-[color:var(--emerald-brand)]" }), title: "OCR Parameters", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Claude Model", hint: "Vision-capable model used for sheet extraction.", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: model, onChange: (e) => setModel(e.target.value), className: "w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-[color:var(--emerald-brand)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "claude-3-5-sonnet-20250101", children: "claude-3-5-sonnet (Recommended)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "claude-3-opus-20240229", children: "claude-3-opus (Highest accuracy)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "claude-3-haiku-20240307", children: "claude-3-haiku (Fastest)" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Extraction Prompt", hint: "Customize how Claude reads each attendance sheet.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: prompt, onChange: (e) => setPrompt(e.target.value), rows: 7, className: "w-full px-4 py-3 rounded-lg border border-border bg-card font-mono text-xs leading-relaxed outline-none focus:border-[color:var(--emerald-brand)]" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: save, className: "px-5 py-2.5 rounded-xl gradient-navy text-white text-sm font-semibold flex items-center gap-2 shadow-md hover:opacity-95", children: saved ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" }),
      " Saved"
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4" }),
      " Save Settings"
    ] }) }) })
  ] }) });
}
function Section({
  icon,
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-elevated rounded-2xl p-6 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
      icon,
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: title })
    ] }),
    children
  ] });
}
function Field({
  label,
  hint,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground", children: label }),
    hint && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: hint }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-1", children })
  ] });
}
export {
  SettingsPage as component
};
