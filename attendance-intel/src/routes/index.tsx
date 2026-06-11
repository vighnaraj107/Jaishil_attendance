import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState, useEffect } from "react";
import {
  Upload, FileText, Users, Building2, Calendar, Download, CheckCircle2,
  Loader2, FileSpreadsheet, ArrowUpRight, Activity,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { api } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · Contractor Attendance" },
      { name: "description", content: "Upload scanned attendance PDFs and generate consolidated monthly Excel files with AI." },
    ],
  }),
  component: DashboardPage,
});

const STEPS = [
  "Converting PDF to high-resolution images...",
  "Executing Claude Vision OCR on Page 1...",
  "Fuzzy matching names and normalizing contractors...",
  "Merging with existing May 2026 records...",
  "Excel updated and saved successfully!",
];

function DashboardPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState(true);

  const loadFiles = useCallback(async () => {
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

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  return (
    <AppShell>
      <div className="space-y-8 max-w-[1400px] mx-auto">
        <Header />
        <StatsGrid filesCount={files.length} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Uploader onUploadSuccess={loadFiles} />
          </div>
          <div className="lg:col-span-2">
            <RecentFiles files={files} loading={filesLoading} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Header() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--emerald-brand)] font-semibold mb-2">
          Dashboard
        </div>
        <h1 className="text-3xl lg:text-4xl font-display font-semibold text-foreground">
          Welcome back, <span className="text-[color:var(--navy)]">Admin</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
          Upload scanned attendance sheets and let Claude Vision compile them into the monthly Excel ledger.
        </p>
      </div>
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl card-elevated">
        <Calendar className="size-4 text-[color:var(--navy)]" />
        <select className="bg-transparent text-sm font-medium outline-none">
          <option>May 2026</option>
          <option>April 2026</option>
          <option>March 2026</option>
        </select>
      </div>
    </div>
  );
}

function StatsGrid({ filesCount }: { filesCount: number }) {
  const stats = [
    { label: "Active Contractors", value: 6, hint: "6 vendors onboarded", icon: Building2, accent: "var(--navy)" },
    { label: "Total Employees", value: 48, hint: "48 listed across shifts", icon: Users, accent: "var(--emerald-brand)" },
    { label: "Ledgers Generated", value: filesCount, hint: "Available in output directory", icon: FileText, accent: "var(--teal-brand)", small: false },
    { label: "Current Month", value: "May 2026", hint: "AI extraction live", icon: Activity, accent: "var(--navy-deep)", small: true },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="card-elevated rounded-2xl p-5 group hover:-translate-y-0.5 transition-all">
          <div className="flex items-start justify-between">
            <div className="size-10 rounded-xl grid place-items-center" style={{ background: `color-mix(in oklab, ${s.accent} 14%, transparent)` }}>
              <s.icon className="size-5" style={{ color: s.accent }} />
            </div>
            <ArrowUpRight className="size-4 text-muted-foreground/40 group-hover:text-[color:var(--emerald-brand)] transition-colors" />
          </div>
          <div className="mt-5">
            <div className={`font-display font-semibold ${s.small ? "text-xl" : "text-3xl"} text-foreground`}>
              {s.value}
            </div>
            <div className="text-xs font-medium text-foreground/80 mt-1">{s.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.hint}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Uploader({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const runPipeline = useCallback(async (file: File) => {
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

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) runPipeline(f);
  };

  return (
    <div className="card-elevated rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-semibold">AI Processing Pipeline</h2>
          <p className="text-xs text-muted-foreground">Drop a scanned PDF to extract attendance via Claude Vision.</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-[color:var(--emerald-brand)]/15 text-[color:var(--emerald-brand)] font-semibold">
          Live
        </span>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
          dragging
            ? "border-[color:var(--emerald-brand)] bg-[color:var(--emerald-brand)]/8"
            : "border-border hover:border-[color:var(--navy)]/40 hover:bg-accent/40"
        }`}
      >
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden"
          onChange={(e) => e.target.files?.[0] && runPipeline(e.target.files[0])} />
        <div className="p-10 text-center">
          <div className="mx-auto size-14 rounded-2xl gradient-navy grid place-items-center shadow-lg mb-4">
            <Upload className="size-6 text-white" />
          </div>
          <div className="font-display font-semibold text-foreground">
            {dragging ? "Release to upload" : "Drop your scanned PDF here"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            or <span className="text-[color:var(--navy)] font-medium">browse files</span> · PDF up to 25 MB
          </div>
        </div>
      </div>

      {step >= 0 && (
        <div className="mt-6 rounded-xl bg-[color:var(--navy-deep)] text-white/90 p-5 font-mono text-xs space-y-2 shadow-inner">
          <div className="flex items-center gap-2 text-white/60 text-[10px] uppercase tracking-wider pb-2 border-b border-white/10">
            <span className="size-2 rounded-full bg-red-400" />
            <span className="size-2 rounded-full bg-amber-400" />
            <span className="size-2 rounded-full bg-emerald-400" />
            <span className="ml-2">claude-vision · {fileName}</span>
          </div>
          {STEPS.map((s, i) => {
            const state = i < step ? "done" : i === step && !done ? "active" : i === step && done ? "done" : "pending";
            return (
              <div key={s} className={`flex items-start gap-2 ${state === "pending" ? "text-white/30" : "text-white/90"}`}>
                {state === "active" ? (
                  <Loader2 className="size-3.5 animate-spin text-[color:var(--emerald-brand)] mt-0.5" />
                ) : state === "done" ? (
                  <CheckCircle2 className="size-3.5 text-[color:var(--emerald-brand)] mt-0.5" />
                ) : (
                  <span className="size-3.5 mt-0.5 grid place-items-center text-white/40">›</span>
                )}
                <span>{s}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RecentFiles({ files, loading }: { files: any[], loading: boolean }) {
  return (
    <div className="card-elevated rounded-2xl p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-semibold">Recent Outputs</h2>
          <p className="text-xs text-muted-foreground">Generated Excel ledgers</p>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="size-6 animate-spin text-[color:var(--navy)]" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-xs">
          No files generated yet. Upload a PDF to start!
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((f) => (
            <div key={f.name} className="group rounded-xl border border-border p-4 hover:border-[color:var(--navy)]/40 hover:bg-accent/40 transition-all">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg gradient-emerald grid place-items-center shrink-0">
                  <FileSpreadsheet className="size-5 text-[color:var(--success-foreground)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm font-medium truncate">{f.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {f.size} · {f.records} records · {f.generatedAt}
                  </div>
                </div>
              </div>
              <a 
                href={f.downloadUrl || `${api.base}/api/download/${f.name}`}
                download
                className="mt-3 w-full gradient-navy text-white text-sm font-medium py-2 rounded-lg flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
              >
                <Download className="size-4" /> Download Excel
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
