import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Server, Brain, Save, Check } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · Contractor Attendance" }] }),
  component: SettingsPage,
});

const DEFAULT_PROMPT = `You are an OCR assistant. Extract attendance from the scanned sheet.
For each row, return JSON with: employee_name, contractor, shift (DAY/NIGHT),
and per-day entries with in_time, out_time, ot_hours. Use 24-hour HH:MM format.
Normalize handwriting variations using fuzzy matching against the canonical list.`;

function SettingsPage() {
  const [apiBase, setApiBase] = useState("https://jaishil-attendance-1.onrender.com");
  const [model, setModel] = useState("claude-sonnet-4-5-20250929");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
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

  return (
    <AppShell>
      <div className="space-y-8 max-w-[900px] mx-auto">
        <div>
          <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--emerald-brand)] font-semibold mb-2">Configuration</div>
          <h1 className="text-3xl font-display font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect the backend and tune the AI extraction pipeline.</p>
        </div>

        <Section icon={<Server className="size-5 text-[color:var(--navy)]" />} title="Backend API">
          <Field label="API Base URL" hint="Render Flask endpoint that handles uploads and storage.">
            <input
              value={apiBase}
              onChange={(e) => setApiBase(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card font-mono text-sm outline-none focus:border-[color:var(--navy)]"
            />
          </Field>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {[
              { m: "POST", p: "/api/upload" },
              { m: "GET", p: "/api/attendance" },
              { m: "PUT", p: "/api/attendance/save" },
              { m: "GET", p: "/api/files" },
            ].map((r) => (
              <div key={r.p} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-secondary/30 font-mono text-xs">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  r.m === "POST" ? "bg-[color:var(--emerald-brand)]/15 text-[color:var(--emerald-brand)]"
                  : r.m === "PUT" ? "bg-[color:var(--warning)]/15 text-[color:var(--warning)]"
                  : "bg-[color:var(--navy)]/15 text-[color:var(--navy)]"
                }`}>{r.m}</span>
                <span className="text-muted-foreground">{r.p}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={<Brain className="size-5 text-[color:var(--emerald-brand)]" />} title="OCR Parameters">
          <Field label="Claude Model" hint="Vision-capable model used for sheet extraction.">
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-[color:var(--emerald-brand)]"
            >
              <option value="claude-sonnet-4-5-20250929">claude-sonnet-4-5 (Recommended)</option>
              <option value="claude-opus-4-5-20251101">claude-opus-4-5 (Highest accuracy)</option>
              <option value="claude-haiku-4-5-20251001">claude-haiku-4-5 (Fastest)</option>
            </select>
          </Field>
          <Field label="Extraction Prompt" hint="Customize how Claude reads each attendance sheet.">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={7}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card font-mono text-xs leading-relaxed outline-none focus:border-[color:var(--emerald-brand)]"
            />
          </Field>
        </Section>

        <div className="flex justify-end gap-3">
          <button
            onClick={save}
            className="px-5 py-2.5 rounded-xl gradient-navy text-white text-sm font-semibold flex items-center gap-2 shadow-md hover:opacity-95"
          >
            {saved ? <><Check className="size-4" /> Saved</> : <><Save className="size-4" /> Save Settings</>}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card-elevated rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      <div className="pt-1">{children}</div>
    </div>
  );
}
