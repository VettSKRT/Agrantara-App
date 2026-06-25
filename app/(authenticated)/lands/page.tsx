"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ─── SVG Icon Components ───────────────────────────────────────────
const IcoPlus    = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" strokeLinecap="round"><path d="M10 4v12M4 10h12"/></svg>;
const IcoRefresh = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round"><path d="M4 10a6 6 0 1 1 1.5 4"/><path d="M4 14v-4h4" strokeLinejoin="round"/></svg>;
const IcoSearch  = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><circle cx="9" cy="9" r="6"/><path d="M15 15l-3-3" strokeLinecap="round"/></svg>;
const IcoEye     = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round"><path d="M1.5 10s3.5-6 8.5-6 8.5 6 8.5 6-3.5 6-8.5 6-8.5-6-8.5-6z"/><circle cx="10" cy="10" r="2.5"/></svg>;
const IcoEdit    = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 2.5a2 2 0 012.8 2.8L6 15.5 2 17l1.5-4 10-10z"/></svg>;
const IcoTrash   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h14M8 5V3h4v2M6 5l.8 11.2A1 1 0 007.8 17h4.4a1 1 0 001-.8L14 5"/></svg>;
const IcoMap     = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4l6-2 6 2 6-2v14l-6 2-6-2-6 2V4z"/><path d="M7 2v14M13 4v14"/></svg>;
const IcoShield  = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M10 1.5L2.5 5v5c0 4.5 3.5 8 7.5 9 4-1 7.5-4.5 7.5-9V5L10 1.5z"/></svg>;
const IcoLand    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20l5-9 3 4 4-7 6 12H3z"/></svg>;
const IcoRuler   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h4M3 15h4M9 3v4M15 3v4"/></svg>;
const IcoCycle   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10a7 7 0 1 1 2 5"/><path d="M4 14V10H8"/></svg>;
const IcoAlert   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><path d="M10 6v4M10 14h.01"/></svg>;
const IcoClose   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round"><path d="M4 4l12 12M16 4L4 16"/></svg>;

// ─── Types ────────────────────────────────────────────────────────
interface Land {
  id: number | string;
  land_name: string;
  commodity_name?: string;
  total_area_hectares: number | string;
  has_polygon?: boolean | number;
  polygon_path?: string | null;
  eudr_status?: string;
  compliance_status?: string;
}

export default function MyLandsPage() {
  const router = useRouter();
  const [lands, setLands]           = useState<Land[]>([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Land | null>(null);
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }
    fetchLands(token);
  }, []);

  async function fetchLands(token?: string) {
    setLoading(true); setError("");
    const t = token || localStorage.getItem("access_token") || "";
    try {
      const res = await fetch("/api/proxy/land/index", {
        headers: { Authorization: `Bearer ${t}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setLands(Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal mengambil data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const t = localStorage.getItem("access_token") || "";
    try {
      const res = await fetch(`/api/proxy/land/delete/${deleteTarget.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams().toString(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDeleteTarget(null);
      fetchLands();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus lahan.");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = useMemo(() =>
    lands.filter(l =>
      (l.land_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.commodity_name || "").toLowerCase().includes(search.toLowerCase())
    ),
  [lands, search]);

  const hasPolygon = (l: Land) =>
    l.has_polygon === 1 || l.has_polygon === true ||
    (l.polygon_path && l.polygon_path !== "[]") ||
    !!localStorage.getItem(`polygon_land_${l.id}`);

  const totalArea  = useMemo(() => lands.reduce((s, l) => s + (Number(l.total_area_hectares) || 0), 0), [lands]);
  const withPoly   = useMemo(() => lands.filter(hasPolygon).length, [lands]);
  const compliant  = useMemo(() => lands.filter(l => ["compliant","verified"].includes((l.eudr_status || l.compliance_status || "").toLowerCase())).length, [lands]);

  function eudrBadge(l: Land) {
    const raw  = (l.eudr_status || l.compliance_status || (hasPolygon(l) ? "compliant" : "pending")).toLowerCase();
    const map: Record<string, { bg: string; color: string; label: string }> = {
      compliant:     { bg: "#dcfce7", color: "#15803d", label: "Compliant" },
      verified:      { bg: "#dcfce7", color: "#15803d", label: "Verified" },
      auditing:      { bg: "#fef3c7", color: "#b45309", label: "Auditing" },
      pending:       { bg: "#fef3c7", color: "#b45309", label: "Pending" },
      "non-compliant":{ bg: "#fee2e2", color: "#b91c1c", label: "Non-Compliant" },
    };
    const s = map[raw] || { bg: "#fee2e2", color: "#b91c1c", label: "Non-Compliant" };
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>
        <IcoShield /> {s.label}
      </span>
    );
  }

  const statCards = [
    { label: "Total Lahan",     value: lands.length,         unit: "Kavling",  icon: <IcoLand />,   color: "#0f172a", accent: "#064e3b" },
    { label: "Total Luas",      value: totalArea.toFixed(1),  unit: "Hektar",   icon: <IcoRuler />,  color: "#1d4ed8", accent: "#1e40af" },
    { label: "Punya Polygon",   value: withPoly,              unit: "Terpetakan",icon: <IcoMap />,   color: "#047857", accent: "#065f46" },
    { label: "EUDR Compliant",  value: compliant,             unit: "Lahan",    icon: <IcoShield />, color: "#9333ea", accent: "#7e22ce" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Hero Header ── */}
      <div style={{ background: "linear-gradient(135deg,#064e3b 0%,#047857 60%,#10b981 100%)", borderRadius: 14, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <IcoLand />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>My Lands</h2>
                <p style={{ margin: 0, fontSize: 13, color: "#a7f3d0" }}>Manajemen lahan dan pemantauan kepatuhan EUDR</p>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.6)", pointerEvents: "none" }}>
                <IcoSearch />
              </span>
              <input
                type="text" placeholder="Cari lahan..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", fontSize: 13, color: "#fff", width: 200, outline: "none" }}
              />
            </div>
            <button onClick={() => fetchLands()}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "#e2e8f0", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
              <IcoRefresh /> Refresh
            </button>
            <button onClick={() => router.push("/lands/create")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: "#fff", color: "#047857", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              <IcoPlus /> Tambah Lahan
            </button>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
          {statCards.map((s, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px", borderLeft: `4px solid ${s.accent}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{s.label}</span>
                <span style={{ color: s.accent }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{s.unit}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#b91c1c", fontSize: 13 }}>
          <IcoAlert /> {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b", fontSize: 14 }}>
          Memuat data lahan...
        </div>
      )}

      {/* ── Table ── */}
      {!loading && !error && (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 750 }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#064e3b,#047857)" }}>
                {["#", "Nama Lahan", "Komoditas", "Luas", "Polygon", "EUDR Status", "Aksi"].map(h => (
                  <th key={h} style={{ padding: "13px 16px", textAlign: "left", color: "#a7f3d0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: "48px 16px", textAlign: "center", color: "#94a3b8" }}>
                    {lands.length === 0 ? "Belum ada data lahan. Klik Tambah Lahan untuk memulai." : "Tidak ada lahan yang cocok."}
                  </td>
                </tr>
              )}
              {filtered.map((land, i) => (
                <tr key={land.id} style={{ borderBottom: "1px solid #f1f5f9", cursor: "default" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0fdf4")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "13px 16px", color: "#94a3b8", fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: "13px 16px", fontWeight: 700, color: "#0f172a" }}>{land.land_name}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ padding: "3px 8px", borderRadius: 20, background: "#e6f4ea", color: "#065f46", border: "1px solid #a7f3d0", fontSize: 11, fontWeight: 600 }}>
                      {land.commodity_name || "—"}
                    </span>
                  </td>
                  <td style={{ padding: "13px 16px", fontWeight: 700, color: "#047857" }}>
                    {land.total_area_hectares} Ha
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    {hasPolygon(land)
                      ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "#1d4ed8" }}><IcoMap /> Terpetakan</span>
                      : <span style={{ fontSize: 12, color: "#94a3b8" }}>Belum Ada</span>}
                  </td>
                  <td style={{ padding: "13px 16px" }}>{eudrBadge(land)}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => router.push(`/lands/${land.id}`)} title="Lihat Detail"
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: "1px solid #e2e8f0", background: "#fff", borderRadius: 7, cursor: "pointer", fontSize: 12, color: "#374151" }}>
                        <IcoEye /> Detail
                      </button>
                      <button onClick={() => router.push(`/lands/${land.id}/edit`)} title="Edit"
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: "1px solid #dbeafe", background: "#eff6ff", borderRadius: 7, cursor: "pointer", fontSize: 12, color: "#1d4ed8" }}>
                        <IcoEdit /> Edit
                      </button>
                      <button onClick={() => setDeleteTarget(land)} title="Hapus"
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: "1px solid #fee2e2", background: "#fff5f5", borderRadius: 7, cursor: "pointer", fontSize: 12, color: "#b91c1c" }}>
                        <IcoTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length > 0 && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#64748b" }}>
              Menampilkan {filtered.length} dari {lands.length} lahan · Total {totalArea.toFixed(2)} Ha
            </div>
          )}
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 32, maxWidth: 440, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#b91c1c" }}>
                <IcoTrash />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Hapus Lahan?</h3>
              <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
                Anda akan menghapus lahan <strong>"{deleteTarget.land_name}"</strong> secara permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                style={{ flex: 1, padding: "11px", border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#374151" }}>
                Batal
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, padding: "11px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: deleting ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700 }}>
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
