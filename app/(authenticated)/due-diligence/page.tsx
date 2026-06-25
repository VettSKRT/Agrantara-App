"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const IcoDiligence = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>;
const IcoCheck    = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8"/></svg>;
const IcoShield   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M10 1.5L2.5 5v5c0 4.5 3.5 8 7.5 9 4-1 7.5-4.5 7.5-9V5L10 1.5z"/></svg>;

const steps = [
  { step: 1, title: "Identifikasi Produk & Operator", desc: "Tentukan komoditas, volume, dan identitas operator perkebunan yang akan diekspor ke EU.", status: "done" },
  { step: 2, title: "Pemetaan Lahan (Geolokasi)", desc: "Semua lahan penghasil komoditas harus dipetakan dengan koordinat GPS/polygon yang terverifikasi.", status: "partial" },
  { step: 3, title: "Penilaian Risiko Deforestasi", desc: "Analisis apakah lahan berada di kawasan yang mengalami deforestasi setelah 31 Desember 2020.", status: "pending" },
  { step: 4, title: "Pengumpulan Bukti Kepatuhan", desc: "Kumpulkan dokumen: sertifikat kepemilikan, foto udara, laporan audit, dan pernyataan non-deforestasi.", status: "pending" },
  { step: 5, title: "Penyusunan Pernyataan Uji Tuntas", desc: "Buat Due Diligence Statement (DDS) yang akan diunggah ke sistem informasi EU sebelum ekspor.", status: "pending" },
];

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  done:    { label: "Selesai",  bg: "#dcfce7", color: "#15803d" },
  partial: { label: "Sebagian", bg: "#fef3c7", color: "#b45309" },
  pending: { label: "Belum",    bg: "#fee2e2", color: "#b91c1c" },
};

export default function DueDiligencePage() {
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

  const polygonCount = lands.filter(l => typeof window !== "undefined" && !!localStorage.getItem(`polygon_land_${l.id}`)).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#064e3b 0%,#047857 60%,#10b981 100%)", borderRadius: 14, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <IcoDiligence />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>Due Diligence Reports</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#a7f3d0" }}>Laporan uji tuntas kepatuhan EUDR untuk ekspor ke pasar Eropa</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 12, padding: "16px 20px", display: "flex", gap: 12 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🚧</span>
        <div>
          <div style={{ fontWeight: 700, color: "#b45309", fontSize: 14, marginBottom: 4 }}>Modul Sedang Dikembangkan</div>
          <p style={{ margin: 0, fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
            Pembuatan Due Diligence Statement (DDS) otomatis memerlukan integrasi penuh dengan sistem backend. Sementara ini, gunakan fitur Harvest Tracing sebagai dokumen penelusuran rantai pasok.
          </p>
          <div style={{ marginTop: 10 }}>
            <button onClick={() => router.push("/harvest-tracing")}
              style={{ padding: "7px 14px", background: "#047857", color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              Buka Harvest Tracing →
            </button>
          </div>
        </div>
      </div>

      {/* Status Readiness */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>Status Kesiapan EUDR Anda</div>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Berdasarkan data yang ada di sistem Agrantara</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
          {[
            { label: "Total Lahan", value: lands.length, desc: "Terdaftar", color: "#064e3b", pass: lands.length > 0 },
            { label: "Terpetakan", value: polygonCount, desc: `dari ${lands.length} lahan`, color: "#1d4ed8", pass: polygonCount > 0 },
            { label: "Dokumen", value: 0, desc: "Menunggu backend", color: "#7e22ce", pass: false },
            { label: "DDS Dibuat", value: 0, desc: "Belum ada laporan", color: "#b45309", pass: false },
          ].map((s, i) => (
            <div key={i} style={{ padding: "14px 16px", background: s.pass ? "#f0fdf4" : "#f8fafc", border: `1px solid ${s.pass ? "#bbf7d0" : "#e2e8f0"}`, borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</span>
                {s.pass && <span style={{ color: "#16a34a" }}><IcoCheck /></span>}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alur Proses */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8 }}>
          <IcoShield /> <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Alur Proses Due Diligence EUDR</span>
        </div>
        <div style={{ padding: "8px 0" }}>
          {steps.map((s, i) => {
            const sc = statusConfig[s.status];
            return (
              <div key={i} style={{ display: "flex", gap: 16, padding: "14px 20px", borderBottom: i < steps.length - 1 ? "1px solid #f8fafc" : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: s.status === "done" ? "#dcfce7" : s.status === "partial" ? "#fef3c7" : "#f1f5f9", border: `2px solid ${s.status === "done" ? "#16a34a" : s.status === "partial" ? "#b45309" : "#e2e8f0"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: s.status === "done" ? "#16a34a" : s.status === "partial" ? "#b45309" : "#94a3b8" }}>
                    {s.status === "done" ? "✓" : s.step}
                  </div>
                  {i < steps.length - 1 && <div style={{ width: 2, height: 20, background: "#e2e8f0" }} />}
                </div>
                <div style={{ flex: 1, paddingTop: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{s.title}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: sc.bg, color: sc.color }}>{sc.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{s.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div style={{ background: "#0f172a", borderRadius: 12, padding: "18px 22px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8", letterSpacing: "1px", marginBottom: 8 }}>EUDR DUE DILIGENCE REGULATION</div>
        <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.7 }}>
          Berdasarkan Regulasi (EU) 2023/1115, semua operator yang mengimpor atau mengekspor ke EU wajib mengumpulkan informasi geografis (GPS/polygon), memastikan tidak ada deforestasi setelah 31 Des 2020, dan menyimpan dokumen setidaknya 5 tahun.
        </p>
      </div>
    </div>
  );
}
