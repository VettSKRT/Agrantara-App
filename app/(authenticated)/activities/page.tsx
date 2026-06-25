"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const IcoActivity = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>;
const IcoList     = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round"><path d="M3 5h14M3 10h14M3 15h14"/></svg>;
const IcoCost     = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8"/><path d="M10 6v8M7.5 8h4a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3H13"/></svg>;
const IcoCalendar = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="16" height="15" rx="2"/><path d="M6 1v4M14 1v4M2 8h16"/></svg>;

export default function ActivitiesPage() {
  const router = useRouter();
  const [lands, setLands]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }
    fetch("/api/proxy/land/index", { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } })
      .then(r => r.json())
      .then(json => setLands(Array.isArray(json) ? json : (json.data || [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activityTypes = [
    { type: "Pemupukan", color: "#065f46", bg: "#ecfdf5", count: 0 },
    { type: "Penyiraman", color: "#1e40af", bg: "#eff6ff", count: 0 },
    { type: "Penyemprotan", color: "#7e22ce", bg: "#faf5ff", count: 0 },
    { type: "Pemangkasan", color: "#b45309", bg: "#fffbeb", count: 0 },
    { type: "Panen", color: "#b91c1c", bg: "#fef2f2", count: 0 },
    { type: "Lainnya", color: "#374151", bg: "#f9fafb", count: 0 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#064e3b 0%,#047857 60%,#10b981 100%)", borderRadius: 14, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <IcoActivity />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>Activity & Cost Logs</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#a7f3d0" }}>Pencatatan aktivitas operasional dan biaya produksi lahan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🚧</span>
        <div>
          <div style={{ fontWeight: 700, color: "#b45309", fontSize: 14, marginBottom: 4 }}>Fitur Sedang Dikembangkan</div>
          <p style={{ margin: 0, fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
            Halaman Activity & Cost Logs menunggu dukungan endpoint backend dari server. Fitur ini akan memungkinkan pencatatan aktivitas pertanian (pemupukan, penyiraman, panen) beserta biaya operasional per siklus tanam.
          </p>
          <div style={{ marginTop: 10 }}>
            <button onClick={() => router.push("/planting-cycles")}
              style={{ padding: "7px 14px", background: "#047857", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Buka Planting Cycles →
            </button>
          </div>
        </div>
      </div>

      {/* Activity Type Preview */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Tipe Aktivitas yang Akan Dikelola</div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>Setiap aktivitas akan terhubung ke siklus tanam dan lahan tertentu</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 1, background: "#f1f5f9" }}>
          {activityTypes.map((a, i) => (
            <div key={i} style={{ padding: "16px 18px", background: "#fff", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", color: a.color, flexShrink: 0 }}>
                <IcoList />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: a.color }}>{a.type}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>0 tercatat</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Land List */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
          <IcoCalendar /> <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Lahan Terdaftar ({lands.length})</span>
        </div>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Memuat data lahan...</div>
        ) : lands.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>Belum ada lahan terdaftar.</div>
        ) : (
          <div className="agr-table-scroll">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 540 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["#", "Nama Lahan", "Komoditas", "Luas", "Aktivitas"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {lands.map((l, i) => (
                <tr key={l.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", color: "#94a3b8" }}>{i + 1}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>{l.land_name}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: 20, background: "#e6f4ea", color: "#065f46", fontSize: 11, fontWeight: 600 }}>{l.commodity_name || "—"}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#047857", fontWeight: 600 }}>{l.total_area_hectares} Ha</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>Belum ada log</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
