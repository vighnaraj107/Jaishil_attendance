import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { api, type Shift } from "@/lib/mock-data";
import { Filter, Save, Download, Sun, Moon, Loader2 } from "lucide-react";

export const Route = createFileRoute("/attendance")({
  head: () => ({ meta: [{ title: "Attendance Grid · Contractor Attendance" }] }),
  component: AttendancePage,
});

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const ROWS: Array<"in" | "out" | "work_hours" | "ot"> = ["in", "out", "work_hours", "ot"];
const ROW_LABEL: Record<string, string> = { in: "IN", out: "OUT", work_hours: "TOTAL", ot: "OT" };

function parseHHMM(v?: string): number {
  if (!v) return 0;
  const [h, m] = v.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function fmtMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function AttendancePage() {
  const [month, setMonth] = useState("May 2026");
  const [contractorId, setContractorId] = useState<string>("shyam");
  const [shift, setShift] = useState<Shift>("DAY");
  const [data, setData] = useState<any>({});
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [contractorsList, setContractorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch data from Flask backend
  useEffect(() => {
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
    return () => { active = false; };
  }, [month]);

  const filtered = useMemo(
    () => employeesList.filter((e) => e.contractorId === contractorId && e.shift === shift),
    [employeesList, contractorId, shift],
  );

  // Automatically update contractorId if the list updates and the current selection is invalid
  useEffect(() => {
    if (contractorsList.length > 0 && !contractorsList.some(c => c.id === contractorId)) {
      setContractorId(contractorsList[0].id);
    }
  }, [contractorsList, contractorId]);

  const updateCell = (empId: string, day: number, row: "in" | "out" | "work_hours" | "ot", value: string) => {
    setData((prev: any) => {
      const empData = { ...prev[empId] };
      const dayData = { ...empData[day], [row]: value };
      
      if (row === "in" || row === "out") {
        const inVal = dayData.in || "";
        const outVal = dayData.out || "";
        if (inVal && outVal) {
          try {
            const [inH, inM] = inVal.split(":").map(Number);
            const [outH, outM] = outVal.split(":").map(Number);
            if (!isNaN(inH) && !isNaN(inM) && !isNaN(outH) && !isNaN(outM)) {
              let diffMin = (outH * 60 + outM) - (inH * 60 + inM);
              if (diffMin < 0) diffMin += 24 * 60;
              const h = Math.floor(diffMin / 60);
              const m = diffMin % 60;
              dayData.work_hours = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
              
              const otMin = Math.max(0, diffMin - 480);
              const otH = Math.floor(otMin / 60);
              const otM = otMin % 60;
              dayData.ot = `${String(otH).padStart(2, "0")}:${String(otM).padStart(2, "0")}`;
            }
          } catch (e) {
            console.error("Error calculating work hours / OT", e);
          }
        } else {
          dayData.work_hours = "";
          dayData.ot = "00:00";
        }
      }
      
      empData[day] = dayData;
      return {
        ...prev,
        [empId]: empData
      };
    });
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
      const monthsMap: Record<string, string> = {
        January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
        July: "07", August: "08", September: "09", October: "10", November: "11", December: "12"
      };
      const mNum = monthsMap[mName] || "05";
      formattedMonth = `${yStr}_${mNum}`;
    }
    window.open(`${api.base}/api/download/attendance_${formattedMonth}.xlsx`, "_blank");
  };

  return (
    <AppShell>
      <div className="space-y-6 max-w-[1800px] mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--emerald-brand)] font-semibold mb-2">Excel Simulator</div>
            <h1 className="text-3xl font-display font-semibold">Attendance Grid</h1>
            <p className="text-sm text-muted-foreground mt-1">Double-click any cell to inline-edit before export.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={saveChanges}
              disabled={saving || loading}
              className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-accent flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button 
              onClick={exportExcel}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl gradient-navy text-white text-sm font-medium flex items-center gap-2 shadow-md hover:opacity-95 disabled:opacity-50"
            >
              <Download className="size-4" /> Export Excel
            </button>
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-4 flex flex-wrap gap-3 items-center">
          <Filter className="size-4 text-muted-foreground ml-2" />
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-muted-foreground">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm font-medium border border-border outline-none"
            >
              <option value="May 2026">May 2026</option>
              <option value="April 2026">April 2026</option>
              <option value="March 2026">March 2026</option>
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs text-muted-foreground">Contractor</label>
            <select
              value={contractorId}
              onChange={(e) => setContractorId(e.target.value)}
              className="bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm font-medium border border-border outline-none"
            >
              {contractorsList.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["DAY", "NIGHT"] as Shift[]).map((s) => (
              <button
                key={s}
                onClick={() => setShift(s)}
                className={`px-4 py-2 text-xs font-semibold flex items-center gap-2 transition-all ${
                  shift === s
                    ? s === "DAY"
                      ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)]"
                      : "bg-[color:var(--navy)]/15 text-[color:var(--navy)]"
                    : "text-muted-foreground hover:bg-accent"
                }`}
              >
                {s === "DAY" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
                {s}
              </button>
            ))}
          </div>
          <div className="ml-auto text-xs text-muted-foreground">
            {filtered.length} employees · {month}
          </div>
        </div>

        {loading ? (
          <div className="card-elevated rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="size-8 animate-spin text-[color:var(--navy)]" />
            <p className="text-sm text-muted-foreground">Loading attendance sheets...</p>
          </div>
        ) : (
          <div className="card-elevated rounded-2xl overflow-hidden">
            <div className="overflow-auto max-h-[70vh]">
              <table className="text-xs border-collapse w-max min-w-full">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-[color:var(--navy-deep)] text-white">
                    <th className="sticky left-0 z-30 bg-[color:var(--navy-deep)] px-3 py-2.5 text-left font-semibold border-r border-white/10 min-w-[180px]">Employee</th>
                    <th className="sticky left-[180px] z-30 bg-[color:var(--navy-deep)] px-2 py-2.5 font-semibold border-r border-white/10">Type</th>
                    {DAYS.map((d) => (
                      <th key={d} className="px-2 py-2.5 font-semibold border-r border-white/10 min-w-[58px]">{d}</th>
                    ))}
                    <th className="px-2 py-2.5 font-semibold border-r border-white/10 bg-[color:var(--navy)] min-w-[80px]">Total Days</th>
                    <th className="px-2 py-2.5 font-semibold border-r border-white/10 bg-[color:var(--navy)] min-w-[80px]">Total OT</th>
                    <th className="px-2 py-2.5 font-semibold bg-[color:var(--navy)] min-w-[70px]">OT Days</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={36} className="text-center py-12 text-muted-foreground">No employees match this filter.</td></tr>
                  )}
                  {filtered.map((emp, idx) => {
                    const totalDays = DAYS.filter((d) => data[emp.id]?.[d]?.in).length;
                    const totalOtMin = DAYS.reduce((a, d) => a + parseHHMM(data[emp.id]?.[d]?.ot), 0);
                    const otDays = (totalOtMin / 60 / 8).toFixed(2);
                    return ROWS.map((row, ri) => (
                      <tr key={`${emp.id}-${row}`} className={`group ${ri === 0 && idx > 0 ? "border-t-2 border-border" : ""}`}>
                        {ri === 0 && (
                          <td rowSpan={4} className="sticky left-0 z-10 bg-card px-3 py-2 border-r border-border align-middle">
                            <div className="font-semibold text-foreground text-sm">{emp.name}</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
                              {contractorsList.find((c) => c.id === emp.contractorId)?.name.split(" ").slice(0, 2).join(" ")} · {emp.shift}
                            </div>
                          </td>
                        )}
                        <td className="sticky left-[180px] z-10 bg-secondary px-2 py-1.5 font-semibold text-[10px] uppercase border-r border-border text-center text-[color:var(--navy)]">
                          {ROW_LABEL[row]}
                        </td>
                        {DAYS.map((d) => {
                          const v = data[emp.id]?.[d]?.[row] || "";
                          return (
                            <td key={d} className="border-r border-border p-0">
                              <input
                                defaultValue={v}
                                onBlur={(e) => updateCell(emp.id, d, row, e.target.value)}
                                className={`w-full h-full px-1.5 py-1.5 text-center font-mono text-[11px] bg-transparent outline-none focus:bg-[color:var(--emerald-brand)]/12 focus:ring-2 focus:ring-[color:var(--emerald-brand)]/50 transition-colors ${
                                  v ? "text-foreground" : "text-muted-foreground/30"
                                }`}
                                placeholder="—"
                              />
                            </td>
                          );
                        })}
                        {ri === 0 && (
                          <>
                            <td rowSpan={4} className="border-r border-border text-center align-middle font-display font-semibold text-[color:var(--navy)] bg-secondary/40">{totalDays}</td>
                            <td rowSpan={4} className="border-r border-border text-center align-middle font-mono text-[color:var(--emerald-brand)] bg-secondary/40">{fmtMinutes(totalOtMin)}</td>
                            <td rowSpan={4} className="text-center align-middle font-mono text-[color:var(--teal-brand)] bg-secondary/40">{otDays}</td>
                          </>
                        )}
                      </tr>
                    ));
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
