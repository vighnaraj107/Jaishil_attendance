import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AppShell } from "./app-shell-w1OeyTXz.mjs";
import { a as api } from "./mock-data-CVfYmLt4.mjs";
import { d as Calendar, b as Building2, U as Users, e as FileText, f as Activity, g as ArrowUpRight, h as Upload, L as LoaderCircle, i as CircleCheck, j as FileSpreadsheet, D as Download } from "../_libs/lucide-react.mjs";
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
const STEPS = ["Converting PDF to high-resolution images...", "Executing Claude Vision OCR on Page 1...", "Fuzzy matching names and normalizing contractors...", "Merging with existing May 2026 records...", "Excel updated and saved successfully!"];
function DashboardPage() {
  const [files, setFiles] = reactExports.useState([]);
  const [filesLoading, setFilesLoading] = reactExports.useState(true);
  const loadFiles = reactExports.useCallback(async () => {
    setFilesLoading(true);
    try {
      const res = await api.getFiles();
      setFiles(res);
    } catch (err) {
      console.error(err);
    } finally {
      setFilesLoading(false);
    }
  }, []);
  reactExports.useEffect(() => {
    loadFiles();
  }, [loadFiles]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8 max-w-[1400px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StatsGrid, { filesCount: files.length }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-5 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Uploader, { onUploadSuccess: loadFiles }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecentFiles, { files, loading: filesLoading }) })
    ] })
  ] }) });
}
function Header() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-[0.18em] text-[color:var(--emerald-brand)] font-semibold mb-2", children: "Dashboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl lg:text-4xl font-display font-semibold text-foreground", children: [
        "Welcome back, ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[color:var(--navy)]", children: "Admin" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1.5 max-w-xl", children: "Upload scanned attendance sheets and let Claude Vision compile them into the monthly Excel ledger." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3.5 py-2.5 rounded-xl card-elevated", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "size-4 text-[color:var(--navy)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "bg-transparent text-sm font-medium outline-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "May 2026" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "April 2026" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "March 2026" })
      ] })
    ] })
  ] });
}
function StatsGrid({
  filesCount
}) {
  const stats = [{
    label: "Active Contractors",
    value: 6,
    hint: "6 vendors onboarded",
    icon: Building2,
    accent: "var(--navy)"
  }, {
    label: "Total Employees",
    value: 48,
    hint: "48 listed across shifts",
    icon: Users,
    accent: "var(--emerald-brand)"
  }, {
    label: "Ledgers Generated",
    value: filesCount,
    hint: "Available in output directory",
    icon: FileText,
    accent: "var(--teal-brand)",
    small: false
  }, {
    label: "Current Month",
    value: "May 2026",
    hint: "AI extraction live",
    icon: Activity,
    accent: "var(--navy-deep)",
    small: true
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: stats.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-elevated rounded-2xl p-5 group hover:-translate-y-0.5 transition-all", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-xl grid place-items-center", style: {
        background: `color-mix(in oklab, ${s.accent} 14%, transparent)`
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "size-5", style: {
        color: s.accent
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "size-4 text-muted-foreground/40 group-hover:text-[color:var(--emerald-brand)] transition-colors" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-display font-semibold ${s.small ? "text-xl" : "text-3xl"} text-foreground`, children: s.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-medium text-foreground/80 mt-1", children: s.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5", children: s.hint })
    ] })
  ] }, s.label)) });
}
function Uploader({
  onUploadSuccess
}) {
  const [dragging, setDragging] = reactExports.useState(false);
  const [step, setStep] = reactExports.useState(-1);
  const [done, setDone] = reactExports.useState(false);
  const [fileName, setFileName] = reactExports.useState(null);
  const inputRef = reactExports.useRef(null);
  const runPipeline = reactExports.useCallback(async (file) => {
    setFileName(file.name);
    setDone(false);
    setStep(0);
    try {
      await api.uploadPdf(file);
      for (let i = 0; i < STEPS.length; i++) {
        setStep(i);
        await new Promise((r) => setTimeout(r, 850));
      }
      setDone(true);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
      setStep(-1);
    }
  }, [onUploadSuccess]);
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) runPipeline(f);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-elevated rounded-2xl p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "AI Processing Pipeline" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Drop a scanned PDF to extract attendance via Claude Vision." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-[color:var(--emerald-brand)]/15 text-[color:var(--emerald-brand)] font-semibold", children: "Live" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onDragOver: (e) => {
      e.preventDefault();
      setDragging(true);
    }, onDragLeave: () => setDragging(false), onDrop, onClick: () => inputRef.current?.click(), className: `relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${dragging ? "border-[color:var(--emerald-brand)] bg-[color:var(--emerald-brand)]/8" : "border-border hover:border-[color:var(--navy)]/40 hover:bg-accent/40"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: inputRef, type: "file", accept: "application/pdf", className: "hidden", onChange: (e) => e.target.files?.[0] && runPipeline(e.target.files[0]) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto size-14 rounded-2xl gradient-navy grid place-items-center shadow-lg mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-6 text-white" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display font-semibold text-foreground", children: dragging ? "Release to upload" : "Drop your scanned PDF here" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
          "or ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[color:var(--navy)] font-medium", children: "browse files" }),
          " · PDF up to 25 MB"
        ] })
      ] })
    ] }),
    step >= 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-xl bg-[color:var(--navy-deep)] text-white/90 p-5 font-mono text-xs space-y-2 shadow-inner", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-white/60 text-[10px] uppercase tracking-wider pb-2 border-b border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 rounded-full bg-red-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 rounded-full bg-amber-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 rounded-full bg-emerald-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2", children: [
          "claude-vision · ",
          fileName
        ] })
      ] }),
      STEPS.map((s, i) => {
        const state = i < step ? "done" : i === step && !done ? "active" : i === step && done ? "done" : "pending";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start gap-2 ${state === "pending" ? "text-white/30" : "text-white/90"}`, children: [
          state === "active" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-3.5 animate-spin text-[color:var(--emerald-brand)] mt-0.5" }) : state === "done" ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-3.5 text-[color:var(--emerald-brand)] mt-0.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-3.5 mt-0.5 grid place-items-center text-white/40", children: "›" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s })
        ] }, s);
      })
    ] })
  ] });
}
function RecentFiles({
  files,
  loading
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-elevated rounded-2xl p-6 h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-semibold", children: "Recent Outputs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Generated Excel ledgers" })
    ] }) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center items-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin text-[color:var(--navy)]" }) }) : files.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground text-xs", children: "No files generated yet. Upload a PDF to start!" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: files.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group rounded-xl border border-border p-4 hover:border-[color:var(--navy)]/40 hover:bg-accent/40 transition-all", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-10 rounded-lg gradient-emerald grid place-items-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "size-5 text-[color:var(--success-foreground)]" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-sm font-medium truncate", children: f.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
            f.size,
            " · ",
            f.records,
            " records · ",
            f.generatedAt
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => f.downloadUrl ? window.open(f.downloadUrl, "_blank") : window.open(`${api.base}/api/download/${f.name}`, "_blank"), className: "mt-3 w-full gradient-navy text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-95 transition-opacity", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
        " Download Excel"
      ] })
    ] }, f.name)) })
  ] });
}
export {
  DashboardPage as component
};
