// Mock data for the Contractor Attendance Dashboard
export type Shift = "DAY" | "NIGHT";

export interface Contractor {
  id: string;
  name: string;
  employees: number;
  color: string;
}

export interface Employee {
  id: string;
  name: string;
  contractorId: string;
  shift: Shift;
}

// entry per (employeeId, day) -> { in, out, ot }
export interface AttendanceEntry {
  in?: string;
  out?: string;
  ot?: string; // HH:MM
}
export type AttendanceMap = Record<string, Record<number, AttendanceEntry>>;

export interface OutputFile {
  name: string;
  size: string;
  generatedAt: string;
  records: number;
}

export interface MappingRule {
  id: string;
  raw: string;
  canonical: string;
  scope: "contractor" | "employee";
}

export const contractors: Contractor[] = [
  { id: "shyam", name: "Shri Shyam", employees: 12, color: "var(--navy)" },
  { id: "ayush", name: "Ayush", employees: 7, color: "var(--teal-brand)" },
  { id: "laxmi", name: "Shri Laxmi", employees: 9, color: "var(--emerald-brand)" },
  { id: "ansh", name: "Ansh", employees: 6, color: "var(--warning)" },
  { id: "radha", name: "Shri Radha", employees: 8, color: "var(--slate-cool)" },
  { id: "jaishil", name: "Jaishil Sulphur and Chemical Industries", employees: 6, color: "var(--navy-deep)" },
];

export const employees: Employee[] = [
  { id: "e1", name: "Sachin Tyagi", contractorId: "shyam", shift: "DAY" },
  { id: "e2", name: "Rajesh Kumar", contractorId: "shyam", shift: "DAY" },
  { id: "e3", name: "Mohit Sharma", contractorId: "shyam", shift: "NIGHT" },
  { id: "e4", name: "Vivek", contractorId: "laxmi", shift: "NIGHT" },
  { id: "e5", name: "Suresh Yadav", contractorId: "laxmi", shift: "DAY" },
  { id: "e6", name: "Nane Pal", contractorId: "ansh", shift: "DAY" },
  { id: "e7", name: "Dinesh", contractorId: "ansh", shift: "NIGHT" },
  { id: "e8", name: "Pawan", contractorId: "ayush", shift: "DAY" },
  { id: "e9", name: "Lokesh", contractorId: "radha", shift: "DAY" },
  { id: "e10", name: "Hari Om", contractorId: "jaishil", shift: "NIGHT" },
];

function genAttendance(): AttendanceMap {
  const map: AttendanceMap = {};
  const times: Array<[string, string, string]> = [
    ["08:00", "20:00", "02:00"],
    ["08:15", "20:05", "01:45"],
    ["07:55", "19:50", "02:30"],
    ["08:05", "20:10", "01:30"],
    ["08:00", "20:00", "02:00"],
  ];
  for (const e of employees) {
    map[e.id] = {};
    for (let d = 1; d <= 5; d++) {
      const t = times[(d + e.id.charCodeAt(1)) % times.length];
      map[e.id][d] = { in: t[0], out: t[1], ot: t[2] };
    }
  }
  return map;
}

export const attendance: AttendanceMap = genAttendance();

export const outputFiles: OutputFile[] = [
  { name: "attendance_2026_05.xlsx", size: "84 KB", generatedAt: "May 4, 2026 · 07:24", records: 218 },
  { name: "attendance_2026_04.xlsx", size: "112 KB", generatedAt: "Apr 30, 2026 · 19:02", records: 286 },
  { name: "attendance_2026_03.xlsx", size: "108 KB", generatedAt: "Mar 31, 2026 · 21:11", records: 271 },
];

export const mappingRules: MappingRule[] = [
  { id: "m1", raw: "Anish Grp", canonical: "Ansh", scope: "contractor" },
  { id: "m2", raw: "Sri Shyam", canonical: "Shri Shyam", scope: "contractor" },
  { id: "m3", raw: "Sachin T.", canonical: "Sachin Tyagi", scope: "employee" },
  { id: "m4", raw: "Vivek Kr", canonical: "Vivek", scope: "employee" },
];

// --- API hooks placeholders ---
const API_BASE = (typeof window !== "undefined" && localStorage.getItem("apiBase")) || "http://localhost:5000";

export const api = {
  uploadPdf: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (err) {
      console.warn("Backend API upload failed, falling back to mock upload:", err);
      await new Promise((r) => setTimeout(r, 600));
      return { ok: true, file: file.name };
    }
  },
  getAttendance: async (month: string) => {
    try {
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
      const res = await fetch(`${API_BASE}/api/attendance?month=${formattedMonth}`);
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      if (!json.attendance || Object.keys(json.attendance).length === 0) {
        console.log("No backend data found for this month, using mock data.");
        return { month, attendance, employees, contractors };
      }
      return json;
    } catch (err) {
      console.warn("Backend API getAttendance failed, falling back to mock data:", err);
      await new Promise((r) => setTimeout(r, 200));
      return { month, attendance, employees, contractors };
    }
  },
  saveAttendance: async (payload: any) => {
    try {
      let formattedMonth = payload.month;
      if (payload.month && payload.month.includes(" ")) {
        const [mName, yStr] = payload.month.split(" ");
        const monthsMap: Record<string, string> = {
          January: "01", February: "02", March: "03", April: "04", May: "05", June: "06",
          July: "07", August: "08", September: "09", October: "10", November: "11", December: "12"
        };
        const mNum = monthsMap[mName] || "05";
        formattedMonth = `${yStr}_${mNum}`;
      }
      const apiPayload = { ...payload, month: formattedMonth };
      const res = await fetch(`${API_BASE}/api/attendance/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (err) {
      console.warn("Backend API saveAttendance failed, falling back to mock save:", err);
      await new Promise((r) => setTimeout(r, 200));
      return { ok: true, payload };
    }
  },
  getFiles: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/files`);
      if (!res.ok) throw new Error("API error");
      const files = await res.json();
      return files.map((f: any) => ({
        ...f,
        downloadUrl: `${API_BASE}/api/download/${f.name}`
      }));
    } catch (err) {
      console.warn("Backend API getFiles failed, falling back to mock files:", err);
      await new Promise((r) => setTimeout(r, 200));
      return outputFiles;
    }
  },
  getMappings: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mappings`);
      if (!res.ok) throw new Error("API error");
      return await res.json();
    } catch (err) {
      await new Promise((r) => setTimeout(r, 200));
      return mappingRules;
    }
  },
  base: API_BASE,
};
