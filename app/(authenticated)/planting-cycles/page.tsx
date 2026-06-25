"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

// ─── Status Icons ─────────────────────────────────────────────────
const IcoBibit     = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M8 14V8M4 10c0-3 2-5.5 4-7 2 1.5 4 4 4 7"/><path d="M8 8c-1.5-1.5-3-2-4-2"/></svg>;
const IcoPerawatan = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v10M5 6c0 2.5 1.5 4 3 5 1.5-1 3-2.5 3-5"/></svg>;
const IcoPanen     = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12l2-4 2 3 2-5 2 3 2-4"/><path d="M1 14h14"/></svg>;
const IcoSelesai   = () => <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M5 8l2.5 2.5 4-4"/></svg>;

type StatusIconProps = { status: CycleStatus; size?: number };
function StatusIcon({ status, size = 16 }: StatusIconProps) {
  const icons: Record<CycleStatus, React.ReactNode> = {
    bibit:     <IcoBibit />,
    perawatan: <IcoPerawatan />,
    panen:     <IcoPanen />,
    selesai:   <IcoSelesai />,
  };
  return <span style={{ display: "inline-flex", alignItems: "center", width: size, height: size }}>{icons[status]}</span>;
}

const STATUS_CONFIG: Record<CycleStatus, { label: string; bg: string; color: string; border: string }> = {
  bibit:     { label: "Pembibitan",  bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  perawatan: { label: "Perawatan",   bg: "#f0f9ff", color: "#0369a1", border: "#bae6fd" },
  panen:     { label: "Siap Panen",  bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
  selesai:   { label: "Selesai",     bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" },
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

export default function PlantingCyclesPage() {
  const router = useRouter();
  const [cycles, setCycles] = useState<PlantingCycle[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLand, setFilterLand] = useState("");
  const [filterStatus, setFilterStatus] = useState<CycleStatus | "">("");
  const [search, setSearch] = useState("");

  // Modal: tambah/edit siklus
  const [cycleModal, setCycleModal] = useState<"add" | "edit" | null>(null);
  const [cycleForm, setCycleForm] = useState({ ...INIT_CYCLE });
  const [editCycleId, setEditCycleId] = useState<string | null>(null);
  const [cycleError, setCycleError] = useState("");
  const [cycleSaving, setCycleSaving] = useState(false);

  // Modal: log aktivitas
  const [activityModal, setActivityModal] = useState<PlantingCycle | null>(null);
  const [actForm, setActForm] = useState({ ...INIT_ACTIVITY });
  const [actError, setActError] = useState("");
  const [actSaving, setActSaving] = useState(false);

  // Modal: detail / delete
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
        fetch("/api/proxy/land/index", { headers: auth }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch("/api/proxy/planting-cycle", { headers: auth }).then(r => r.json()).catch(() => ({ data: [] })),
      ]);
      setLands(Array.isArray(landRes) ? landRes : (landRes.data || []));
      setCycles(Array.isArray(cycleRes) ? cycleRes : (cycleRes.data || []));
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
      if (!res.ok || data.success === false || data.status === false) {
        setCycleError(data.message || data.msg || `HTTP ${res.status}`);
        return;
      }
      setCycleModal(null); setEditCycleId(null);
      setCycleForm({ ...INIT_CYCLE });
      fetchAll();
    } catch (err: unknown) {
      setCycleError(err instanceof Error ? err.message : "Gagal menyimpan siklus.");
    } finally {
      setCycleSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const t = localStorage.getItem("access_token") || "";
    try {
      const res = await fetch(`/api/proxy/planting-cycle/delete/${deleteTarget.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDeleteTarget(null);
      fetchAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus siklus.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleSaveActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!actForm.activity_type) { setActError("Pilih jenis aktivitas."); return; }
    if (!actForm.activity_date) { setActError("Tanggal aktivitas wajib diisi."); return; }
    setActSaving(true); setActError("");
    const t = localStorage.getItem("access_token") || "";
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
      if (!res.ok || data.success === false) {
        setActError(data.message || data.msg || `HTTP ${res.status}`);
        return;
      }
      setActivityModal(null);
      setActForm({ ...INIT_ACTIVITY });
      fetchAll();
    } catch (err: unknown) {
      setActError(err instanceof Error ? err.message : "Gagal menyimpan aktivitas.");
    } finally {
      setActSaving(false);
    }
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
            style={{ padding: "10px 18px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            + Tambah Siklus Baru
          </button>
        </div>
      </div>

      {/* Status summary cards */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14 }}>
          {(Object.keys(STATUS_CONFIG) as CycleStatus[]).map(s => {
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s}
                onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
                style={{ background: filterStatus === s ? cfg.bg : "#fff", border: `1px solid ${filterStatus === s ? cfg.border : "#e2e8f0"}`, borderRadius: 12, padding: "14px 18px", cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ marginBottom: 8, color: cfg.color }}><StatusIcon status={s} size={20} /></div>
                <div style={{ fontSize: 22, fontWeight: 800, color: cfg.color }}>{statusCounts[s]}</div>
                <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{cfg.label}</div>
              </div>
            );
          })}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 18px" }}>
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
          style={{ flex: 1, minWidth: 180, padding: "9px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }}
        />
        <select value={filterLand} onChange={e => setFilterLand(e.target.value)}
          style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, background: "#fff", outline: "none" }}>
          <option value="">Semua Lahan</option>
          {lands.map(l => <option key={l.id} value={String(l.id)}>{l.land_name}</option>)}
        </select>
        {filterStatus && (
          <button onClick={() => setFilterStatus("")}
            style={{ padding: "9px 12px", border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#dc2626" }}>
            × Clear Filter
          </button>
        )}
        <span style={{ fontSize: 13, color: "#64748b" }}>{filtered.length} siklus</span>
      </div>

      {/* Loading */}
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
                return (
                  <tr key={cycle.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "13px 14px", color: "#94a3b8" }}>{i + 1}</td>
                    <td style={{ padding: "13px 14px", fontWeight: 600, color: "#0f172a" }}>
                      {cycle.land_name || land?.land_name || `Lahan #${cycle.land_id}`}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: 20, background: "#e6f4ea", color: "#065f46", border: "1px solid #a7f3d0", fontSize: 11, fontWeight: 500 }}>
                        {cycle.commodity_name || land?.commodity_name || "-"}
                      </span>
                    </td>
                    <td style={{ padding: "13px 14px", color: "#374151", whiteSpace: "nowrap" }}>
                      {cycle.start_date ? new Date(cycle.start_date).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td style={{ padding: "13px 14px", color: "#374151", whiteSpace: "nowrap" }}>
                      {cycle.expected_harvest_date ? new Date(cycle.expected_harvest_date).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <StatusIcon status={cycle.status} /> {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: "13px 14px", textAlign: "center" }}>
                      <button
                        onClick={() => { setActivityModal(cycle); setActForm({ ...INIT_ACTIVITY }); setActError(""); }}
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #f1f5f9", paddingBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                {cycleModal === "add" ? "Tambah Siklus Tanam Baru" : "Edit Siklus Tanam"}
              </h3>
              <button onClick={() => setCycleModal(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>×</button>
            </div>

            {cycleError && <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, marginBottom: 16 }}>{cycleError}</div>}

            <form onSubmit={handleSaveCycle} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Lahan <span style={{ color: "#dc2626" }}>*</span></label>
                <select value={cycleForm.land_id} onChange={e => setCycleForm(f => ({ ...f, land_id: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, background: "#fff", outline: "none" }}>
                  <option value="">-- Pilih Lahan --</option>
                  {lands.map(l => <option key={l.id} value={String(l.id)}>{l.land_name}{l.commodity_name ? ` (${l.commodity_name})` : ""}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Tanggal Mulai Tanam <span style={{ color: "#dc2626" }}>*</span></label>
                  <input type="date" value={cycleForm.start_date} onChange={e => setCycleForm(f => ({ ...f, start_date: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Perkiraan Panen</label>
                  <input type="date" value={cycleForm.expected_harvest_date} onChange={e => setCycleForm(f => ({ ...f, expected_harvest_date: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Status Siklus <span style={{ color: "#dc2626" }}>*</span></label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {(Object.keys(STATUS_CONFIG) as CycleStatus[]).map(s => {
                    const cfg = STATUS_CONFIG[s];
                    const active = cycleForm.status === s;
                    return (
                      <button key={s} type="button" onClick={() => setCycleForm(f => ({ ...f, status: s }))}
                        style={{ padding: "10px 14px", borderRadius: 8, border: `2px solid ${active ? cfg.color : "#e2e8f0"}`, background: active ? cfg.bg : "#fff", color: active ? cfg.color : "#374151", cursor: "pointer", fontSize: 13, fontWeight: active ? 700 : 500, display: "flex", alignItems: "center", gap: 8, transition: "all 0.15s" }}>
                        <StatusIcon status={s} /> {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Catatan</label>
                <textarea value={cycleForm.notes} onChange={e => setCycleForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Informasi tambahan tentang siklus ini..."
                  rows={3}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setCycleModal(null)} style={{ padding: "9px 18px", border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>Batal</button>
                <button type="submit" disabled={cycleSaving}
                  style={{ padding: "9px 18px", background: cycleSaving ? "#6b7280" : "#10b981", color: "#fff", border: "none", borderRadius: 8, cursor: cycleSaving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}>
                  {cycleSaving ? "Menyimpan..." : cycleModal === "add" ? "Tambah Siklus" : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {activityModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, maxWidth: 500, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #f1f5f9", paddingBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Log Aktivitas Perawatan</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                  Lahan: <strong>{activityModal.land_name || `#${activityModal.land_id}`}</strong>
                </p>
              </div>
              <button onClick={() => setActivityModal(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>×</button>
            </div>

            {/* Riwayat aktivitas */}
            {activityModal.activities && activityModal.activities.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Riwayat Aktivitas</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {activityModal.activities.map((act, i) => (
                    <div key={i} style={{ padding: "10px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <strong>{act.activity_type}</strong>
                        <span style={{ fontSize: 11, color: "#64748b" }}>{new Date(act.activity_date).toLocaleDateString("id-ID")}</span>
                      </div>
                      {act.notes && <div style={{ color: "#64748b", marginTop: 4 }}>{act.notes}</div>}
                      {act.cost && <div style={{ color: "#16a34a", fontSize: 12, marginTop: 4 }}>Rp {Number(act.cost).toLocaleString("id-ID")}</div>}
                    </div>
                  ))}
                </div>
                <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "18px 0" }} />
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 14 }}>Tambah Aktivitas Baru</div>

            {actError && <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, marginBottom: 14 }}>{actError}</div>}

            <form onSubmit={handleSaveActivity} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Jenis Aktivitas <span style={{ color: "#dc2626" }}>*</span></label>
                <select value={actForm.activity_type} onChange={e => setActForm(f => ({ ...f, activity_type: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, background: "#fff", outline: "none" }}>
                  <option value="">-- Pilih Jenis Aktivitas --</option>
                  {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Tanggal <span style={{ color: "#dc2626" }}>*</span></label>
                  <input type="date" value={actForm.activity_date} onChange={e => setActForm(f => ({ ...f, activity_date: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Biaya (Rp)</label>
                  <input type="number" placeholder="Contoh: 50000" value={actForm.cost} onChange={e => setActForm(f => ({ ...f, cost: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Catatan</label>
                <textarea value={actForm.notes} onChange={e => setActForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Detail aktivitas yang dilakukan..."
                  rows={2}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setActivityModal(null)} style={{ padding: "9px 18px", border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>Tutup</button>
                <button type="submit" disabled={actSaving}
                  style={{ padding: "9px 18px", background: actSaving ? "#6b7280" : "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: actSaving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}>
                  {actSaving ? "Menyimpan..." : "Catat Aktivitas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, maxWidth: 420, width: "100%" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                <svg viewBox="0 0 20 20" fill="none" stroke="#b91c1c" strokeWidth="1.8" width="24" height="24" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h14M8 5V3h4v2M6 5l.7 11a1 1 0 001 .9h4.6a1 1 0 001-.9L14 5"/></svg>
              </div>
              <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}>Hapus Siklus Tanam?</h3>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
                Siklus untuk lahan <strong>"{deleteTarget.land_name || `#${deleteTarget.land_id}`}"</strong> akan dihapus beserta semua aktivitasnya.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setDeleteTarget(null)} style={{ padding: "9px 18px", border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, cursor: "pointer", fontWeight: 500 }}>Batal</button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ padding: "9px 18px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: deleting ? "not-allowed" : "pointer", fontWeight: 600 }}>
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
