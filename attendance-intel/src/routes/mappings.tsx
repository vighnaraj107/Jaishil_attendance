import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { contractors as initialContractors, mappingRules as initialRules } from "@/lib/mock-data";
import { Plus, Trash2, ArrowRight, Wand2, Building2 } from "lucide-react";

export const Route = createFileRoute("/mappings")({
  head: () => ({ meta: [{ title: "Mapping Rules · Contractor Attendance" }] }),
  component: MappingsPage,
});

function MappingsPage() {
  const [rules, setRules] = useState(initialRules);
  const [contractors, setContractors] = useState(initialContractors);
  const [raw, setRaw] = useState("");
  const [canonical, setCanonical] = useState("");
  const [newContractor, setNewContractor] = useState("");

  const addRule = () => {
    if (!raw || !canonical) return;
    setRules((r) => [{ id: crypto.randomUUID(), raw, canonical, scope: "contractor" }, ...r]);
    setRaw(""); setCanonical("");
  };

  return (
    <AppShell>
      <div className="space-y-8 max-w-[1200px] mx-auto">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--emerald-brand)] font-semibold mb-2">Normalization</div>
          <h1 className="text-3xl font-display font-semibold">Fuzzy Matching & Mapping Rules</h1>
          <p className="text-sm text-muted-foreground mt-1">Teach the OCR pipeline to fix recurring misreads.</p>
        </div>

        <div className="card-elevated rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Wand2 className="size-5 text-[color:var(--emerald-brand)]" />
            <h2 className="font-display text-lg font-semibold">Manual OCR Fixes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-3 items-center mb-6 p-4 rounded-xl bg-secondary/50 border border-dashed border-border">
            <input
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Raw OCR text (e.g. Anish Grp)"
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-[color:var(--navy)]"
            />
            <ArrowRight className="size-4 text-muted-foreground mx-auto" />
            <input
              value={canonical}
              onChange={(e) => setCanonical(e.target.value)}
              placeholder="Canonical name (e.g. Ansh)"
              className="px-4 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-[color:var(--navy)]"
            />
            <button onClick={addRule} className="px-4 py-2.5 rounded-lg gradient-emerald text-[color:var(--success-foreground)] text-sm font-semibold flex items-center gap-2">
              <Plus className="size-4" /> Add
            </button>
          </div>

          <div className="rounded-xl overflow-hidden border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-secondary-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Raw OCR</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Canonical</th>
                  <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Scope</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {rules.map((r) => (
                  <tr key={r.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.raw}</td>
                    <td className="px-4 py-3 font-medium">{r.canonical}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                        r.scope === "contractor"
                          ? "bg-[color:var(--navy)]/12 text-[color:var(--navy)]"
                          : "bg-[color:var(--teal-brand)]/15 text-[color:var(--teal-brand)]"
                      }`}>{r.scope}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setRules((p) => p.filter((x) => x.id !== r.id))}
                        className="size-8 grid place-items-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="size-5 text-[color:var(--navy)]" />
            <h2 className="font-display text-lg font-semibold">Canonical Contractors</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {contractors.map((c) => (
              <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-border hover:border-[color:var(--navy)]/40 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-lg grid place-items-center font-display font-bold text-white text-sm shrink-0" style={{ background: c.color as string }}>
                    {c.name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.employees} employees</div>
                  </div>
                </div>
                <button
                  onClick={() => setContractors((p) => p.filter((x) => x.id !== c.id))}
                  className="size-8 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <input
              value={newContractor}
              onChange={(e) => setNewContractor(e.target.value)}
              placeholder="Add new contractor name"
              className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-[color:var(--navy)]"
            />
            <button
              onClick={() => {
                if (!newContractor) return;
                setContractors((p) => [...p, { id: crypto.randomUUID(), name: newContractor, employees: 0, color: "var(--slate-cool)" }]);
                setNewContractor("");
              }}
              className="px-4 py-2.5 rounded-lg gradient-navy text-white text-sm font-semibold flex items-center gap-2"
            >
              <Plus className="size-4" /> Add Contractor
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
