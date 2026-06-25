"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const IcoCert  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1.5L3 6v5c0 5.5 4 10 9 11 5-1 9-5.5 9-11V6L12 1.5z"/><path d="M9 12l2.5 2.5L16 9"/></svg>;
const IcoLeaf  = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17c0-5.5 3.5-9.5 10-11-1.5 5-4 8.5-10 11z"/><path d="M3 17l3-3"/></svg>;

const certs = [
  { name: "RSPO (Roundtable on Sustainable Palm Oil)", body: "RSPO International", scope: "Sawit", color: "#065f46", bg: "#ecfdf5" },
  { name: "ISPO (Indonesia Sustainable Palm Oil)", body: "Kementerian Pertanian RI", scope: "Sawit", color: "#1e40af", bg: "#eff6ff" },
  { name: "Rainforest Alliance", body: "SAN — Sustainable Agriculture Network", scope: "Kopi, Kakao, Teh", color: "#15803d", bg: "#f0fdf4" },
  { name: "Fairtrade Certification", body: "Fairtrade International", scope: "Kopi, Kakao, Gula", color: "#b45309", bg: "#fffbeb" },
  { name: "EUDR Declaration of Conformity", body: "EU Commission", scope: "Semua komoditas ekspor", color: "#7e22ce", bg: "#faf5ff" },
  { name: "SNI Pertanian Organik", body: "BSN Indonesia", scope: "Semua komoditas organik", color: "#374151", bg: "#f9fafb" },
];

export default function CertificationsPage() {
  const router = useRouter();
  const [lands, setLands] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }
    fetch("/api/proxy/land/index", { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } })
      .then(r => r.json())
      .then(json => setLands(Array.isArray(json) ? json : (json.data || [])))
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#064e3b 0%,#047857 60%,#10b981 100%)", borderRadius: 14, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <IcoCert />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>Certifications</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#a7f3d0" }}>Sertifikasi keberlanjutan dan kepatuhan ekspor EUDR</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 12 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🚧</span>
        <div>
          <div style={{ fontWeight: 700, color: "#b45309", fontSize: 14, marginBottom: 4 }}>Modul Sedang Dikembangkan</div>
          <p style={{ margin: 0, fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
            Manajemen sertifikasi memerlukan integrasi dengan badan sertifikasi eksternal (RSPO, ISPO, dll.) melalui endpoint backend yang sedang disiapkan.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
        {[
          { label: "Total Lahan", value: lands.length, unit: "Lahan terdaftar", accent: "#064e3b" },
          { label: "Sertifikat Aktif", value: 0, unit: "Belum ada", accent: "#1e40af" },
          { label: "Kadaluarsa Soon", value: 0, unit: "—", accent: "#b45309" },
          { label: "Proses Audit", value: 0, unit: "—", accent: "#7e22ce" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px", borderLeft: `4px solid ${s.accent}` }}>
            <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Cert Types */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
          <IcoLeaf />
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Jenis Sertifikasi yang Didukung</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {certs.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: i < certs.length - 1 ? "1px solid #f8fafc" : "none" }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", color: c.color, flexShrink: 0 }}>
                <IcoCert />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{c.body} · Cakupan: {c.scope}</div>
              </div>
              <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#f8fafc", color: "#94a3b8", fontWeight: 700, border: "1px solid #e2e8f0" }}>Segera Hadir</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "#0f172a", borderRadius: 12, padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#38bdf8", marginBottom: 4 }}>Mulai dari Dokumen Lahan</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Upload dokumen sertifikasi yang sudah dimiliki melalui menu Land Documents</div>
        </div>
        <button onClick={() => router.push("/land-documents")}
          style={{ padding: "9px 18px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
          Buka Land Documents →
        </button>
      </div>
    </div>
  );
}
