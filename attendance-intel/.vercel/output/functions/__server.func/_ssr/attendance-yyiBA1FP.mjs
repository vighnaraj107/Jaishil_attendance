import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AppShell } from "./app-shell-w1OeyTXz.mjs";
import { a as api } from "./mock-data-CVfYmLt4.mjs";
import { L as LoaderCircle, a as Save, D as Download, F as Funnel, c as Sun, M as Moon } from "../_libs/lucide-react.mjs";
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
const DAYS = Array.from({
  length: 31
}, (_, i) => i + 1);
const ROWS = ["in", "out", "ot"];
const ROW_LABEL = {
  in: "IN",
  out: "OUT",
  ot: "OT"
};
function parseHHMM(v) {
  if (!v) return 0;
  const [h, m] = v.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}
function fmtMinutes(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function AttendancePage() {
  const [month, setMonth] = reactExports.useState("May 2026");
  const [contractorId, setContractorId] = reactExports.useState("shyam");
  const [shift, setShift] = reactExports.useState("DAY");
  const [data, setData] = reactExports.useState({});
  const [employeesList, setEmployeesList] = reactExports.useState([]);
  const [contractorsList, setContractorsList] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    let active = true;
    setLoading(true);
    api.getAttendance(month).then((res) => {
      if (!active) return;
      setData(res.attendance);
      setEmployeesList(res.employees);
      setContractorsList(res.contractors);
      setLoading(false);
    }).catch((err) => {
      console.error("Failed to load attendance", err);
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [month]);
  const filtered = reactExports.useMemo(() => employeesList.filter((e) => e.contractorId === contractorId && e.shift === shift), [employeesList, contractorId, shift]);
  reactExports.useEffect(() => {
    if (contractorsList.length > 0 && !contractorsList.some((c) => c.id === contractorId)) {
      setContractorId(contractorsList[0].id);
    }
  }, [contractorsList, contractorId]);
  const updateCell = (empId, day, row, value) => {
    setData((prev) => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [day]: {
          ...prev[empId]?.[day],
          [row]: value
        }
      }
    }));
  };
  const saveChanges = async () => {
    setSaving(true);
    try {
      await api.saveAttendance({
        month,
        attendance: data,
        employees: employeesList,
        contractors: contractorsList
      });
      alert("Attendance saved to Excel successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };
  const exportExcel = () => {
    let formattedMonth = month;
    if (month.includes(" ")) {
      const [mName, yStr] = month.split(" ");
      const monthsMap = {
        January: "01",
        February: "02",
        March: "03",
        April: "04",
        May: "05",
        June: "06",
        July: "07",
        August: "08",
        September: "09",
        October: "10",
        November: "11",
        December: "12"
      };
      const mNum = monthsMap[mName] || "05";
      formattedMonth = `${yStr}_${mNum}`;
    }
    window.open(`${api.base}/api/download/attendance_${formattedMonth}.xlsx`, "_blank");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-[1800px] mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-end justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-[0.18em] text-[color:var(--emerald-brand)] font-semibold mb-2", children: "Excel Simulator" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-display font-semibold", children: "Attendance Grid" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Double-click any cell to inline-edit before export." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: saveChanges, disabled: saving || loading, className: "px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent flex items-center gap-2 disabled:opacity-50", children: [
          saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4" }),
          saving ? "Saving..." : "Save Changes"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: exportExcel, disabled: loading, className: "px-4 py-2.5 rounded-xl gradient-navy text-white text-sm font-medium flex items-center gap-2 shadow-md hover:opacity-95 disabled:opacity-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
          " Export Excel"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-elevated rounded-2xl p-4 flex flex-wrap gap-3 items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "size-4 text-muted-foreground ml-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground", children: "Month" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: month, onChange: (e) => setMonth(e.target.value), className: "bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm font-medium border border-border outline-none", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "May 2026", children: "May 2026" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "April 2026", children: "April 2026" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "March 2026", children: "March 2026" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground", children: "Contractor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: contractorId, onChange: (e) => setContractorId(e.target.value), className: "bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm font-medium border border-border outline-none", children: contractorsList.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c.id, children: c.name }, c.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex rounded-lg border border-border overflow-hidden", children: ["DAY", "NIGHT"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShift(s), className: `px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-all ${shift === s ? s === "DAY" ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)]" : "bg-[color:var(--navy)]/15 text-[color:var(--navy)]" : "text-muted-foreground hover:bg-accent"}`, children: [
        s === "DAY" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "size-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "size-3.5" }),
        s
      ] }, s)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto text-xs text-muted-foreground", children: [
        filtered.length,
        " employees · ",
        month
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card-elevated rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-8 animate-spin text-[color:var(--navy)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Loading attendance sheets..." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "card-elevated rounded-2xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-auto max-h-[70vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "text-xs border-collapse w-max min-w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "sticky top-0 z-20", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-[color:var(--navy-deep)] text-white", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "sticky left-0 z-30 bg-[color:var(--navy-deep)] px-3 py-2.5 text-left font-semibold border-r border-white/10 min-w-[180px]", children: "Employee" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "sticky left-[180px] z-30 bg-[color:var(--navy-deep)] px-2 py-2.5 font-semibold border-r border-white/10", children: "Type" }),
        DAYS.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2.5 font-semibold border-r border-white/10 min-w-[58px]", children: d }, d)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2.5 font-semibold border-r border-white/10 bg-[color:var(--navy)] min-w-[80px]", children: "Total Days" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2.5 font-semibold border-r border-white/10 bg-[color:var(--navy)] min-w-[80px]", children: "Total OT" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-2.5 font-semibold bg-[color:var(--navy)] min-w-[70px]", children: "OT Days" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 36, className: "text-center py-12 text-muted-foreground", children: "No employees match this filter." }) }),
        filtered.map((emp, idx) => {
          const totalDays = DAYS.filter((d) => data[emp.id]?.[d]?.in).length;
          const totalOtMin = DAYS.reduce((a, d) => a + parseHHMM(data[emp.id]?.[d]?.ot), 0);
          const otDays = (totalOtMin / 60 / 8).toFixed(2);
          return ROWS.map((row, ri) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `group ${ri === 0 && idx > 0 ? "border-t-2 border-border" : ""}`, children: [
            ri === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { rowSpan: 3, className: "sticky left-0 z-10 bg-card px-3 py-2 border-r border-border align-middle", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-foreground text-sm", children: emp.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5", children: [
                contractorsList.find((c) => c.id === emp.contractorId)?.name.split(" ").slice(0, 2).join(" "),
                " · ",
                emp.shift
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "sticky left-[180px] z-10 bg-secondary px-2 py-1.5 font-semibold text-[10px] uppercase border-r border-border text-center text-[color:var(--navy)]", children: ROW_LABEL[row] }),
            DAYS.map((d) => {
              const v = data[emp.id]?.[d]?.[row] || "";
              return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "border-r border-border p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { defaultValue: v, onBlur: (e) => updateCell(emp.id, d, row, e.target.value), className: `w-full h-full px-1.5 py-1.5 text-center font-mono text-[11px] bg-transparent outline-none focus:bg-[color:var(--emerald-brand)]/12 focus:ring-2 focus:ring-[color:var(--emerald-brand)]/50 transition-colors ${v ? "text-foreground" : "text-muted-foreground/30"}`, placeholder: "—" }) }, d);
            }),
            ri === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { rowSpan: 3, className: "border-r border-border text-center align-middle font-display font-semibold text-[color:var(--navy)] bg-secondary/40", children: totalDays }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { rowSpan: 3, className: "border-r border-border text-center align-middle font-mono text-[color:var(--emerald-brand)] bg-secondary/40", children: fmtMinutes(totalOtMin) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { rowSpan: 3, className: "text-center align-middle font-mono text-[color:var(--teal-brand)] bg-secondary/40", children: otDays })
            ] })
          ] }, `${emp.id}-${row}`));
        })
      ] })
    ] }) }) })
  ] }) });
}
export {
  AttendancePage as component
};
