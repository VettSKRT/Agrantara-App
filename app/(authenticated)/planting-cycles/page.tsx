"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────
type CycleStatus = "bibit" | "perawatan" | "panen" | "selesai";

interface PlantingCycle {
  id: number | string;
  land_id: number | string;
  land_name?: string;
  commodity_name?: string;
  start_date: string;
  expected_harvest_date?: string;
  actual_harvest_date?: string;
  status: CycleStatus;
  notes?: string;
  activities?: Activity[];
}

interface Activity {
  id: number | string;
  cycle_id: number | string;
  activity_type: string;
  activity_date: string;
  notes?: string;
  cost?: number;
}

interface Land {
  id: number | string;
  land_name: string;
  commodity_name?: string;
}

// ─── LocalStorage helpers ─────────────────────────────────────────
const LS_CYCLES = "local_planting_cycles";
function loadLocalCycles(): PlantingCycle[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_CYCLES) || "[]"); } catch { return []; }
}
function saveLocalCycles(cycles: PlantingCycle[]) {
  localStorage.setItem(LS_CYCLES, JSON.stringify(cycles));
}
function loadLocalActs(cycleId: number | string): Activity[] {
  try { return JSON.parse(localStorage.getItem(`local_acts_${cycleId}`) || "[]"); } catch { return []; }
}
function addLocalAct(cycleId: number | string, act: Activity) {
  const existing = loadLocalActs(cycleId);
  localStorage.setItem(`local_acts_${cycleId}`, JSON.stringify([...existing, act]));
}

// ─── Status Icons ─────────────────────────────────────────────────
const IcoBibit     = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14V8M4 10c0-3 2-5.5 4-7 2 1.5 4 4 4 7"/><path d="M8 8c-1.5-1.5-3-2-4-2"/></svg>;
const IcoPerawatan = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v10M5 6c0 2.5 1.5 4 3 5 1.5-1 3-2.5 3-5"/></svg>;
const IcoPanen     = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-4 2 3 2-5 2 3 2-4"/><path d="M1 14h14"/></svg>;
const IcoSelesai   = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M5 8l2.5 2.5 4-4"/></svg>;
const IcoCalendar  = () => <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><rect x="1.5" y="3" width="15" height="13.5" rx="2"/><path d="M6 1.5v3M12 1.5v3M1.5 7.5h15"/><circle cx="6" cy="11.5" r="1" fill="currentColor" stroke="none"/><circle cx="9" cy="11.5" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="11.5" r="1" fill="currentColor" stroke="none"/></svg>;

type StatusIconProps = { status: CycleStatus; size?: number };
function StatusIcon({ status, size = 16 }: StatusIconProps) {
  const icons: Record<CycleStatus, React.ReactNode> = {
    bibit: <IcoBibit />, perawatan: <IcoPerawatan />, panen: <IcoPanen />, selesai: <IcoSelesai />,
  };
  return <span style={{ display: "inline-flex", alignItems: "center", width: size, height: size }}>{icons[status]}</span>;
}

const STATUS_CONFIG: Record<CycleStatus, { label: string; bg: string; color: string; border: string }> = {
  bibit:     { label: "Pembibitan", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  perawatan: { label: "Perawatan",  bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
  panen:     { label: "Siap Panen", bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
  selesai:   { label: "Selesai",    bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
};

const ACTIVITY_TYPES = [
  "Pengairan / Irigasi",
  "Pemupukan",
  "Penanganan Hama / Pest Control",
  "Penyemprotan Pestisida",
  "Pemangkasan / Pruning",
  "Pencatatan Pertumbuhan",
  "Pemanenan",
  "Lainnya",
];

const INIT_CYCLE = { land_id: "", start_date: "", expected_harvest_date: "", status: "bibit" as CycleStatus, notes: "" };
const INIT_ACTIVITY = { cycle_id: "", activity_type: "", activity_date: "", notes: "", cost: "" };

// ─── DateInput — Custom Calendar Picker ──────────────────────────
const MONTHS_ID = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DAYS_ID   = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];

function DateInput({
  value, onChange, min, max, align = "left",
}: { value: string; onChange: (v: string) => void; min?: string; max?: string; align?: "left" | "right"; }) {
  const today = new Date().toISOString().split("T")[0];
  const initDate = value ? new Date(value + "T00:00:00") : new Date();
  const [open, setOpen]         = useState(false);
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const wrapRef = useRef<HTMLDivElement>(null);

  // Sync view when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function selectDay(day: number) {
    const mm = String(viewMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const dateStr = `${viewYear}-${mm}-${dd}`;
    onChange(dateStr);
    setOpen(false);
  }

  // Build calendar grid cells (null = empty leading slots)
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const fmt = value
    ? new Date(value + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          padding: "11px 36px 11px 42px",
          borderRadius: 10,
          border: `2px solid ${open ? "#10b981" : "#e2e8f0"}`,
          background: open ? "#f0fdf4" : "#fff",
          textAlign: "left",
          cursor: "pointer",
          fontSize: 14,
          color: value ? "#0f172a" : "#9ca3af",
          minHeight: 46,
          transition: "all 0.2s",
          boxShadow: open ? "0 0 0 3px rgba(16,185,129,0.1)" : "none",
          outline: "none",
          position: "relative",
        }}
      >
        {fmt || "Pilih tanggal..."}
        {/* Calendar icon */}
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: open ? "#10b981" : "#94a3b8", display: "flex", alignItems: "center" }}>
          <IcoCalendar />
        </span>
        {/* Arrow */}
        <span style={{ position: "absolute", right: 12, top: "50%", transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, transition: "transform 0.2s", color: "#64748b", fontSize: 10, lineHeight: 1 }}>▾</span>
      </button>

      {/* Calendar dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          ...(align === "right" ? { right: 0 } : { left: 0 }),
          zIndex: 700,
          background: "#fff",
          border: "1.5px solid #e2e8f0",
          borderRadius: 14,
          boxShadow: "0 16px 48px rgba(0,0,0,0.16)",
          padding: "14px 14px 12px",
          width: 288,
          userSelect: "none",
        }}>
          {/* Month/Year navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button type="button" onClick={prevMonth}
              style={{ width: 30, height: 30, border: "1.5px solid #e2e8f0", borderRadius: 8, cursor: "pointer", background: "#fff", fontSize: 15, color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
              ‹
            </button>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{MONTHS_ID[viewMonth]}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#047857", background: "#f0fdf4", padding: "2px 8px", borderRadius: 6 }}>{viewYear}</span>
            </div>
            <button type="button" onClick={nextMonth}
              style={{ width: 30, height: 30, border: "1.5px solid #e2e8f0", borderRadius: 8, cursor: "pointer", background: "#fff", fontSize: 15, color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
              ›
            </button>
          </div>

          {/* Day-of-week headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 4 }}>
            {DAYS_ID.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#94a3b8", padding: "3px 0" }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const mm = String(viewMonth + 1).padStart(2, "0");
              const dd = String(day).padStart(2, "0");
              const dateStr = `${viewYear}-${mm}-${dd}`;
              const isSelected = value === dateStr;
              const isToday    = dateStr === today;
              const disabled   = (!!min && dateStr < min) || (!!max && dateStr > max);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  style={{
                    height: 34,
                    borderRadius: 8,
                    border: isToday && !isSelected ? "1.5px solid #10b981" : "1.5px solid transparent",
                    background: isSelected ? "#10b981" : "transparent",
                    color: isSelected ? "#fff" : disabled ? "#d1d5db" : isToday ? "#047857" : "#374151",
                    fontSize: 13,
                    fontWeight: isSelected || isToday ? 700 : 400,
                    cursor: disabled ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { if (!isSelected && !disabled) (e.currentTarget as HTMLButtonElement).style.background = "#f0fdf4"; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
            <button type="button" onClick={() => { onChange(today); setOpen(false); }}
              style={{ flex: 1, padding: "7px 0", border: "1.5px solid #e2e8f0", borderRadius: 8, cursor: "pointer", background: "#f8fafc", fontSize: 12, fontWeight: 600, color: "#374151" }}>
              Hari Ini
            </button>
            {value && (
              <button type="button" onClick={() => { onChange(""); setOpen(false); }}
                style={{ padding: "7px 12px", border: "1.5px solid #fecaca", borderRadius: 8, cursor: "pointer", background: "#fef2f2", fontSize: 12, fontWeight: 600, color: "#dc2626" }}>
                Hapus
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CustomSelect Component ───────────────────────────────────────
function CustomSelect({
  value, onChange, options, placeholder = "Pilih...", disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const sel = options.find(o => o.value === value);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(o => !o)}
        style={{
          width: "100%",
          padding: "11px 36px 11px 14px",
          borderRadius: 10,
          border: `2px solid ${open ? "#10b981" : "#e2e8f0"}`,
          background: disabled ? "#f9fafb" : open ? "#f0fdf4" : "#fff",
          fontSize: 14,
          color: value ? "#0f172a" : "#9ca3af",
          textAlign: "left",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.2s",
          outline: "none",
          position: "relative",
          minHeight: 46,
          boxShadow: open ? "0 0 0 3px rgba(16,185,129,0.1)" : "none",
        }}
      >
        {sel?.label || placeholder}
        <span style={{
          position: "absolute",
          right: 13,
          top: "50%",
          transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
          transition: "transform 0.2s",
          color: "#64748b",
          fontSize: 10,
          lineHeight: 1,
        }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          right: 0,
          background: "#fff",
          border: "1.5px solid #e2e8f0",
          borderRadius: 12,
          boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
          zIndex: 600,
          maxHeight: 240,
          overflowY: "auto",
        }}>
          {options.map((opt, i) => (
            <div
              key={i}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: "11px 14px",
                cursor: "pointer",
                fontSize: 14,
                color: opt.value === value ? "#047857" : "#374151",
                background: opt.value === value ? "#f0fdf4" : "#fff",
                fontWeight: opt.value === value ? 600 : 400,
                borderBottom: i < options.length - 1 ? "1px solid #f8fafc" : "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (opt.value !== value) (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = opt.value === value ? "#f0fdf4" : "#fff"; }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: "50%",
                border: `2px solid ${opt.value === value ? "#10b981" : "#d1d5db"}`,
                background: opt.value === value ? "#10b981" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.15s",
              }}>
                {opt.value === value && (
                  <svg viewBox="0 0 8 8" fill="none" width="8" height="8">
                    <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function PlantingCyclesPage() {
  const router = useRouter();
  const [cycles, setCycles] = useState<PlantingCycle[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLand, setFilterLand] = useState("");
  const [filterStatus, setFilterStatus] = useState<CycleStatus | "">("");
  const [search, setSearch] = useState("");

  const [cycleModal, setCycleModal] = useState<"add" | "edit" | null>(null);
  const [cycleForm, setCycleForm] = useState({ ...INIT_CYCLE });
  const [editCycleId, setEditCycleId] = useState<string | null>(null);
  const [cycleError, setCycleError] = useState("");
  const [cycleSaving, setCycleSaving] = useState(false);

  const [activityModal, setActivityModal] = useState<PlantingCycle | null>(null);
  const [actForm, setActForm] = useState({ ...INIT_ACTIVITY });
  const [actError, setActError] = useState("");
  const [actSaving, setActSaving] = useState(false);
  const [localActs, setLocalActs] = useState<Activity[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<PlantingCycle | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }
    fetchAll(token);
  }, []);

  async function fetchAll(token?: string) {
    setLoading(true);
    const t = token || localStorage.getItem("access_token") || "";
    const auth = { Authorization: `Bearer ${t}`, Accept: "application/json" };
    try {
      const [landRes, cycleRes] = await Promise.all([
        fetch("/api/proxy/land/index", { headers: auth }).then(r => r.json()).catch(() => null),
        fetch("/api/proxy/planting-cycle", { headers: auth }).then(r => r.json()).catch(() => null),
      ]);

      if (landRes) {
        setLands(Array.isArray(landRes) ? landRes : (landRes.data || []));
      }

      const localCycles = loadLocalCycles();
      if (cycleRes && (Array.isArray(cycleRes) || cycleRes?.data)) {
        const apiCycles: PlantingCycle[] = Array.isArray(cycleRes) ? cycleRes : (cycleRes.data || []);
        const apiIds = new Set(apiCycles.map(c => String(c.id)));
        const localOnly = localCycles.filter(c => !apiIds.has(String(c.id)));
        setCycles([...apiCycles, ...localOnly]);
      } else {
        setCycles(localCycles);
      }
    } catch {
      setCycles(loadLocalCycles());
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveCycle(e: React.FormEvent) {
    e.preventDefault();
    if (!cycleForm.land_id) { setCycleError("Pilih lahan."); return; }
    if (!cycleForm.start_date) { setCycleError("Tanggal mulai tanam wajib diisi."); return; }
    setCycleSaving(true); setCycleError("");
    const t = localStorage.getItem("access_token") || "";

    let apiSuccess = false;
    try {
      const body = new URLSearchParams();
      Object.entries(cycleForm).forEach(([k, v]) => v && body.append(k, String(v)));
      const url = cycleModal === "edit" && editCycleId
        ? `/api/proxy/planting-cycle/update/${editCycleId}`
        : "/api/proxy/planting-cycle/create";
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false && data.status !== false) apiSuccess = true;
    } catch {}

    if (!apiSuccess) {
      const land = lands.find(l => String(l.id) === cycleForm.land_id);
      const localCycles = loadLocalCycles();
      if (cycleModal === "edit" && editCycleId) {
        const exists = localCycles.find(c => String(c.id) === String(editCycleId));
        if (exists) {
          saveLocalCycles(localCycles.map(c =>
            String(c.id) === String(editCycleId)
              ? { ...c, ...cycleForm, land_name: land?.land_name, commodity_name: land?.commodity_name }
              : c
          ));
        } else {
          const fromApi = cycles.find(c => String(c.id) === String(editCycleId));
          if (fromApi) {
            saveLocalCycles([...localCycles, { ...fromApi, ...cycleForm, land_name: land?.land_name, commodity_name: land?.commodity_name }]);
          }
        }
      } else {
        const newCycle: PlantingCycle = {
          id: `local_${Date.now()}`,
          land_id: cycleForm.land_id,
          land_name: land?.land_name,
          commodity_name: land?.commodity_name,
          start_date: cycleForm.start_date,
          expected_harvest_date: cycleForm.expected_harvest_date || undefined,
          status: cycleForm.status,
          notes: cycleForm.notes || undefined,
        };
        saveLocalCycles([...localCycles, newCycle]);
      }
      toast.success("Siklus tanam berhasil disimpan secara lokal.");
    }

    setCycleModal(null); setEditCycleId(null);
    setCycleForm({ ...INIT_CYCLE });
    setCycleSaving(false);
    fetchAll();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const t = localStorage.getItem("access_token") || "";
    const isLocal = String(deleteTarget.id).startsWith("local_");

    if (!isLocal) {
      try {
        await fetch(`/api/proxy/planting-cycle/delete/${deleteTarget.id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${t}` },
        });
      } catch {}
    }

    const updated = loadLocalCycles().filter(c => String(c.id) !== String(deleteTarget.id));
    saveLocalCycles(updated);
    setDeleteTarget(null);
    setDeleting(false);
    fetchAll();
  }

  function openActivityModal(cycle: PlantingCycle) {
    setActivityModal(cycle);
    setActForm({ ...INIT_ACTIVITY });
    setActError("");
    setLocalActs(loadLocalActs(cycle.id));
  }

  async function handleSaveActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!actForm.activity_type) { setActError("Pilih jenis aktivitas."); return; }
    if (!actForm.activity_date) { setActError("Tanggal aktivitas wajib diisi."); return; }
    setActSaving(true); setActError("");
    const t = localStorage.getItem("access_token") || "";

    let apiSuccess = false;
    try {
      const body = new URLSearchParams();
      body.append("cycle_id", String(activityModal!.id));
      body.append("activity_type", actForm.activity_type);
      body.append("activity_date", actForm.activity_date);
      if (actForm.notes) body.append("notes", actForm.notes);
      if (actForm.cost) body.append("cost", actForm.cost);
      const res = await fetch("/api/proxy/cycle-activity/create", {
        method: "POST",
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) apiSuccess = true;
    } catch {}

    const newAct: Activity = {
      id: `local_act_${Date.now()}`,
      cycle_id: activityModal!.id,
      activity_type: actForm.activity_type,
      activity_date: actForm.activity_date,
      notes: actForm.notes || undefined,
      cost: actForm.cost ? Number(actForm.cost) : undefined,
    };

    if (!apiSuccess) {
      addLocalAct(activityModal!.id, newAct);
      setLocalActs(prev => [...prev, newAct]);
      toast.success("Aktivitas disimpan secara lokal.");
    }

    setActForm({ ...INIT_ACTIVITY });
    setActSaving(false);
    if (apiSuccess) { setActivityModal(null); fetchAll(); }
  }

  const filtered = useMemo(() => cycles.filter(c => {
    const lMatch = filterLand ? String(c.land_id) === filterLand : true;
    const sMatch = filterStatus ? c.status === filterStatus : true;
    const qMatch = search
      ? (c.land_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.commodity_name || "").toLowerCase().includes(search.toLowerCase())
      : true;
    return lMatch && sMatch && qMatch;
  }), [cycles, filterLand, filterStatus, search]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { bibit: 0, perawatan: 0, panen: 0, selesai: 0 };
    cycles.forEach(c => { if (c.status in counts) counts[c.status]++; });
    return counts;
  }, [cycles]);

  const landOptions = lands.map(l => ({
    value: String(l.id),
    label: l.land_name + (l.commodity_name ? ` (${l.commodity_name})` : ""),
  }));
  const statusFilterOptions: { value: string; label: string }[] = [
    { value: "", label: "Semua Status" },
    ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
  ];
  const landFilterOptions = [{ value: "", label: "Semua Lahan" }, ...lands.map(l => ({ value: String(l.id), label: l.land_name }))];
  const actTypeOptions = ACTIVITY_TYPES.map(t => ({ value: t, label: t }));

  const allActivities = [...(activityModal?.activities || []), ...localActs];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Hero Header */}
      <div style={{ background: "linear-gradient(135deg,#064e3b,#047857)", borderRadius: 14, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <IcoPanen />
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>Siklus Tanam</h2>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#a7f3d0" }}>
              Kelola siklus pertanian dari bibit → perawatan → hingga panen
            </p>
          </div>
          <button
            onClick={() => { setCycleModal("add"); setCycleForm({ ...INIT_CYCLE }); setCycleError(""); }}
            style={{ padding: "10px 18px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(16,185,129,0.3)" }}
          >
            + Tambah Siklus Baru
          </button>
        </div>
      </div>

      {/* Status summary cards */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 14 }}>
          {(Object.keys(STATUS_CONFIG) as CycleStatus[]).map(s => {
            const cfg = STATUS_CONFIG[s];
            const active = filterStatus === s;
            return (
              <div key={s}
                onClick={() => setFilterStatus(active ? "" : s)}
                style={{ background: active ? cfg.bg : "#fff", border: `2px solid ${active ? cfg.border : "#e2e8f0"}`, borderRadius: 12, padding: "14px 18px", cursor: "pointer", transition: "all 0.15s", boxShadow: active ? `0 4px 12px ${cfg.border}` : "none" }}>
                <div style={{ marginBottom: 8, color: cfg.color }}><StatusIcon status={s} size={20} /></div>
                <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color }}>{statusCounts[s]}</div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{cfg.label}</div>
              </div>
            );
          })}
          <div style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ marginBottom: 8, color: "#0f172a" }}><IcoPanen /></div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a" }}>{cycles.length}</div>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Total Siklus</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ background: "#fff", padding: "14px 16px", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text" placeholder="Cari lahan atau komoditas..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180, padding: "9px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", transition: "border-color 0.2s" }}
          onFocus={e => e.target.style.borderColor = "#10b981"}
          onBlur={e => e.target.style.borderColor = "#e2e8f0"}
        />
        <div style={{ minWidth: 160 }}>
          <CustomSelect value={filterLand} onChange={setFilterLand} options={landFilterOptions} placeholder="Semua Lahan" />
        </div>
        {filterStatus && (
          <button onClick={() => setFilterStatus("")}
            style={{ padding: "9px 12px", border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#dc2626" }}>
            × Clear Filter
          </button>
        )}
        <span style={{ fontSize: 13, color: "#64748b" }}>{filtered.length} siklus</span>
      </div>

      {loading && <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>Memuat data siklus tanam...</div>}

      {/* Table */}
      {!loading && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 750 }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#064e3b,#047857)", color: "#a7f3d0" }}>
                {["#", "Lahan", "Komoditas", "Mulai Tanam", "Est. Panen", "Status", "Aktivitas", "Aksi"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, textTransform: "uppercase", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: "48px 14px", textAlign: "center", color: "#94a3b8" }}>
                  {cycles.length === 0
                    ? "Belum ada siklus tanam. Klik tombol Tambah Siklus Baru."
                    : "Tidak ada siklus yang cocok dengan filter."}
                </td></tr>
              )}
              {filtered.map((cycle, i) => {
                const cfg = STATUS_CONFIG[cycle.status] || STATUS_CONFIG.bibit;
                const land = lands.find(l => String(l.id) === String(cycle.land_id));
                const isLocal = String(cycle.id).startsWith("local_");
                return (
                  <tr key={cycle.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "13px 14px", color: "#94a3b8" }}>{i + 1}</td>
                    <td style={{ padding: "13px 14px", fontWeight: 600, color: "#0f172a" }}>
                      {cycle.land_name || land?.land_name || `Lahan #${cycle.land_id}`}
                      {isLocal && <span style={{ marginLeft: 6, fontSize: 10, padding: "1px 5px", borderRadius: 4, background: "#fef3c7", color: "#b45309" }}>Lokal</span>}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: 20, background: "#e6f4ea", color: "#065f46", border: "1px solid #a7f3d0", fontSize: 11, fontWeight: 500 }}>
                        {cycle.commodity_name || land?.commodity_name || "-"}
                      </span>
                    </td>
                    <td style={{ padding: "13px 14px", color: "#374151", whiteSpace: "nowrap" }}>
                      {cycle.start_date ? new Date(cycle.start_date + "T00:00:00").toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td style={{ padding: "13px 14px", color: "#374151", whiteSpace: "nowrap" }}>
                      {cycle.expected_harvest_date ? new Date(cycle.expected_harvest_date + "T00:00:00").toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <StatusIcon status={cycle.status} /> {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: "13px 14px", textAlign: "center" }}>
                      <button
                        onClick={() => openActivityModal(cycle)}
                        style={{ padding: "5px 10px", border: "1px solid #bfdbfe", background: "#eff6ff", borderRadius: 6, fontSize: 12, color: "#2563eb", cursor: "pointer", fontWeight: 500 }}>
                        Log Aktivitas
                      </button>
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => {
                            setCycleModal("edit"); setEditCycleId(String(cycle.id)); setCycleError("");
                            setCycleForm({ land_id: String(cycle.land_id), start_date: cycle.start_date, expected_harvest_date: cycle.expected_harvest_date || "", status: cycle.status, notes: cycle.notes || "" });
                          }}
                          style={{ padding: "5px 10px", border: "1px solid #e2e8f0", background: "#fff", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
                          Edit
                        </button>
                        <button onClick={() => setDeleteTarget(cycle)}
                          style={{ padding: "5px 10px", border: "1px solid #fee2e2", background: "#fff", borderRadius: 6, fontSize: 12, cursor: "pointer", color: "#dc2626" }}>
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Cycle Modal */}
      {cycleModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 540, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #f1f5f9", paddingBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                  {cycleModal === "add" ? "Tambah Siklus Tanam Baru" : "Edit Siklus Tanam"}
                </h3>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Isi detail siklus tanam untuk lahan Anda</p>
              </div>
              <button onClick={() => setCycleModal(null)} style={{ background: "#f8fafc", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#64748b", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            {cycleError && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span>⚠</span> {cycleError}
              </div>
            )}

            <form onSubmit={handleSaveCycle} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                  Lahan <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <CustomSelect
                  value={cycleForm.land_id}
                  onChange={v => setCycleForm(f => ({ ...f, land_id: v }))}
                  options={landOptions}
                  placeholder="-- Pilih Lahan --"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                    Tanggal Mulai Tanam <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <DateInput
                    value={cycleForm.start_date}
                    onChange={v => setCycleForm(f => ({ ...f, start_date: v }))}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                    Perkiraan Panen
                  </label>
                  <DateInput
                    value={cycleForm.expected_harvest_date}
                    onChange={v => setCycleForm(f => ({ ...f, expected_harvest_date: v }))}
                    min={cycleForm.start_date || undefined}
                    align="right"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
                  Status Siklus <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(Object.keys(STATUS_CONFIG) as CycleStatus[]).map(s => {
                    const cfg = STATUS_CONFIG[s];
                    const active = cycleForm.status === s;
                    return (
                      <button key={s} type="button" onClick={() => setCycleForm(f => ({ ...f, status: s }))}
                        style={{ padding: "11px 14px", borderRadius: 10, border: `2px solid ${active ? cfg.color : "#e2e8f0"}`, background: active ? cfg.bg : "#fafbfc", color: active ? cfg.color : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s", boxShadow: active ? `0 2px 8px ${cfg.border}` : "none" }}>
                        <StatusIcon status={s} /> {cfg.label}
                        {active && <span style={{ marginLeft: "auto", fontSize: 12 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Catatan</label>
                <textarea value={cycleForm.notes} onChange={e => setCycleForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Informasi tambahan tentang siklus ini..."
                  rows={3}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #e2e8f0", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#10b981"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                <button type="button" onClick={() => setCycleModal(null)} style={{ padding: "10px 20px", border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#374151" }}>Batal</button>
                <button type="submit" disabled={cycleSaving}
                  style={{ padding: "10px 20px", background: cycleSaving ? "#6b7280" : "linear-gradient(135deg,#047857,#10b981)", color: "#fff", border: "none", borderRadius: 10, cursor: cycleSaving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600, boxShadow: cycleSaving ? "none" : "0 2px 8px rgba(16,185,129,0.3)" }}>
                  {cycleSaving ? "Menyimpan..." : cycleModal === "add" ? "Tambah Siklus" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {activityModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #f1f5f9", paddingBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Log Aktivitas Perawatan</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                  Lahan: <strong>{activityModal.land_name || `#${activityModal.land_id}`}</strong>
                </p>
              </div>
              <button onClick={() => setActivityModal(null)} style={{ background: "#f8fafc", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#64748b", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            {allActivities.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Riwayat Aktivitas</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {allActivities.map((act, i) => (
                    <div key={i} style={{ padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 13 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <strong>{act.activity_type}</strong>
                        <span style={{ fontSize: 11, color: "#64748b" }}>{new Date(act.activity_date + "T00:00:00").toLocaleDateString("id-ID")}</span>
                      </div>
                      {act.notes && <div style={{ color: "#64748b", marginTop: 4, fontSize: 12 }}>{act.notes}</div>}
                      {act.cost && <div style={{ color: "#16a34a", fontSize: 12, marginTop: 4 }}>Rp {Number(act.cost).toLocaleString("id-ID")}</div>}
                    </div>
                  ))}
                </div>
                <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "18px 0" }} />
              </div>
            )}

            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>Tambah Aktivitas Baru</div>

            {actError && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, marginBottom: 14 }}>
                {actError}
              </div>
            )}

            <form onSubmit={handleSaveActivity} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                  Jenis Aktivitas <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <CustomSelect
                  value={actForm.activity_type}
                  onChange={v => setActForm(f => ({ ...f, activity_type: v }))}
                  options={actTypeOptions}
                  placeholder="-- Pilih Jenis Aktivitas --"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                    Tanggal <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <DateInput
                    value={actForm.activity_date}
                    onChange={v => setActForm(f => ({ ...f, activity_date: v }))}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Biaya (Rp)</label>
                  <input type="number" placeholder="Contoh: 50000" value={actForm.cost}
                    onChange={e => setActForm(f => ({ ...f, cost: e.target.value }))}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                    onFocus={e => e.target.style.borderColor = "#10b981"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Catatan</label>
                <textarea value={actForm.notes} onChange={e => setActForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Detail aktivitas yang dilakukan..."
                  rows={2}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #e2e8f0", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#10b981"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setActivityModal(null)} style={{ padding: "10px 20px", border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 10, cursor: "pointer", fontSize: 14, color: "#374151" }}>Tutup</button>
                <button type="submit" disabled={actSaving}
                  style={{ padding: "10px 20px", background: actSaving ? "#6b7280" : "linear-gradient(135deg,#1d4ed8,#3b82f6)", color: "#fff", border: "none", borderRadius: 10, cursor: actSaving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}>
                  {actSaving ? "Menyimpan..." : "Catat Aktivitas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, maxWidth: 420, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg viewBox="0 0 20 20" fill="none" stroke="#b91c1c" strokeWidth="1.8" width="24" height="24" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h14M8 5V3h4v2M6 5l.7 11a1 1 0 001 .9h4.6a1 1 0 001-.9L14 5"/></svg>
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}>Hapus Siklus Tanam?</h3>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
                Siklus untuk lahan <strong>&ldquo;{deleteTarget.land_name || `#${deleteTarget.land_id}`}&rdquo;</strong> akan dihapus beserta semua aktivitasnya.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: "10px 20px", border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 10, cursor: "pointer", fontWeight: 500 }}>Batal</button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ padding: "10px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 10, cursor: deleting ? "not-allowed" : "pointer", fontWeight: 600 }}>
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
