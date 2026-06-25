"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const IcoShield  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L3 6v5c0 5.5 4 10 9 11 5-1 9-5.5 9-11V6L12 2z"/></svg>;
const IcoCheck   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8"/></svg>;
const IcoX       = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" strokeLinecap="round"><path d="M4 4l12 12M16 4L4 16"/></svg>;
const IcoInfo    = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><path d="M10 9v5M10 6h.01"/></svg>;
const IcoMap     = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4l6-2 6 2 6-2v14l-6 2-6-2-6 2V4z"/></svg>;

export default function EudrCompliancePage() {
  const router = useRouter();
  const [landId, setLandId]   = useState<string | null>(null);
  const [land, setLand]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasPolygon, setHasPolygon] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { setLoading(false); return; }
    setLandId(id);
    setHasPolygon(!!localStorage.getItem(`polygon_land_${id}`));

    fetch(`/api/proxy/land/view/${id}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then(r => r.json())
      .then(res => { if (res.status && res.data) setLand(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const checks = [
    { label: "Polygon batas lahan terdefinisi", pass: hasPolygon, note: hasPolygon ? "Koordinat polygon tersimpan di sistem" : "Tambahkan polygon di menu Polygon Mapping" },
    { label: "Data komoditas tercatat", pass: !!land?.commodity_id, note: land?.commodity_id ? `Komoditas ID: ${land.commodity_id}` : "Belum ada data komoditas" },
    { label: "Koordinat GPS tersedia", pass: !!(land?.latitude && land?.longitude), note: (land?.latitude && land?.longitude) ? `${land.latitude}, ${land.longitude}` : "Koordinat belum tersedia" },
    { label: "Luas lahan terdata", pass: !!land?.total_area_hectares, note: land?.total_area_hectares ? `${land.total_area_hectares} Hektar` : "Luas belum terdata" },
  ];

  const passCount = checks.filter(c => c.pass).length;
  const total = checks.length;
  const rate = Math.round((passCount / total) * 100);
  const overallStatus = rate === 100 ? "Compliant" : rate >= 50 ? "Partial" : "Non-Compliant";
  const statusColor = rate === 100 ? "#15803d" : rate >= 50 ? "#b45309" : "#b91c1c";
  const statusBg    = rate === 100 ? "#dcfce7"  : rate >= 50 ? "#fef3c7"  : "#fee2e2";

  if (loading) return <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>Memuat data kepatuhan...</div>;

  if (!landId) return (
    <div style={{ padding: 24, textAlign: "center", color: "#dc2626", fontWeight: 600 }}>
      ID Lahan tidak ditemukan. <button onClick={() => router.back()} style={{ color: "#047857", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Kembali</button>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => router.back()}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, border: "1.5px solid #a7f3d0", background: "linear-gradient(135deg,#ecfdf5,#f0fdf4)", fontSize: 13, fontWeight: 600, color: "#065f46", cursor: "pointer", transition: "all 0.18s", boxShadow: "0 1px 4px rgba(16,185,129,0.1)" }}
          onMouseEnter={e => { Object.assign(e.currentTarget.style, { background: "linear-gradient(135deg,#d1fae5,#ecfdf5)", borderColor: "#6ee7b7", boxShadow: "0 3px 10px rgba(16,185,129,0.2)", transform: "translateX(-2px)" }); }}
          onMouseLeave={e => { Object.assign(e.currentTarget.style, { background: "linear-gradient(135deg,#ecfdf5,#f0fdf4)", borderColor: "#a7f3d0", boxShadow: "0 1px 4px rgba(16,185,129,0.1)", transform: "translateX(0)" }); }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
          Kembali
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Pemeriksaan Kepatuhan EUDR</h2>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b" }}>{land?.land_name || `Lahan #${landId}`}</p>
        </div>
      </div>

      {/* Score Card */}
      <div style={{ background: "linear-gradient(135deg,#064e3b,#047857)", borderRadius: 14, padding: "24px 28px", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg viewBox="0 0 80 80" width="90" height="90">
            <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10"/>
            <circle cx="40" cy="40" r="30" fill="none" stroke={rate === 100 ? "#34d399" : rate >= 50 ? "#fbbf24" : "#f87171"} strokeWidth="10"
              strokeDasharray={`${Math.round(188.5 * rate / 100)} 188.5`} strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}/>
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{rate}%</span>
          </div>
        </div>
        <div>
          <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: statusBg, color: statusColor, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            {overallStatus}
          </span>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            {passCount} dari {total} kriteria terpenuhi
          </div>
          <div style={{ fontSize: 13, color: "#a7f3d0" }}>
            {rate === 100 ? "Lahan ini siap ekspor ke pasar Eropa (EUDR compliant)." :
             rate >= 50 ? "Beberapa kriteria perlu dilengkapi sebelum ekspor." :
             "Lahan belum memenuhi persyaratan EUDR. Segera lengkapi data."}
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
          <IcoShield /> <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Daftar Periksa EUDR</span>
        </div>
        <div>
          {checks.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px", borderBottom: i < checks.length - 1 ? "1px solid #f8fafc" : "none" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.pass ? "#dcfce7" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: c.pass ? "#15803d" : "#b91c1c" }}>
                {c.pass ? <IcoCheck /> : <IcoX />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 3 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}><IcoInfo /> {c.note}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: c.pass ? "#dcfce7" : "#fef2f2", color: c.pass ? "#15803d" : "#b91c1c", whiteSpace: "nowrap" }}>
                {c.pass ? "Terpenuhi" : "Perlu Aksi"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Info EUDR */}
      <div style={{ background: "#0f172a", borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", letterSpacing: "1px", marginBottom: 8 }}>TENTANG EUDR (EU) 2023/1115</div>
        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.7 }}>
          Regulasi EUDR mensyaratkan bahwa semua komoditas yang masuk ke pasar Eropa harus bebas deforestasi sejak 31 Desember 2020. Lahan harus memiliki bukti koordinat geografis, tidak berada di kawasan hutan yang dilindungi, dan memiliki rantai pasok yang dapat ditelusuri.
        </p>
      </div>

      {/* Action Button */}
      {!hasPolygon && (
        <button onClick={() => router.push(`/land-polygon/manage-polygon?id=${landId}`)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", background: "#064e3b", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          <IcoMap /> Tambah Polygon Sekarang
        </button>
      )}
    </div>
  );
}
