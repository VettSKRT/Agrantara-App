"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

// ─── SVG Icons ────────────────────────────────────────────────────
const IcoLand     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20l5-9 3 4 4-7 6 12H3z"/></svg>;
const IcoRuler    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h4M3 15h4M9 3v4M15 3v4"/></svg>;
const IcoCycle    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round"><path d="M4 10a7 7 0 1 1 2 5"/><path d="M4 14V10H8" strokeLinejoin="round"/></svg>;
const IcoShield   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L3 6v5c0 5.5 4 10 9 11 5-1 9-5.5 9-11V6L12 2z"/><path d="M9 12l2.5 2.5L16 9"/></svg>;
const IcoMap      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" strokeLinecap="round" strokeLinejoin="round"><path d="M1 5l7-3 8 3 7-3v16l-7 3-8-3-7 3V5z"/><path d="M8 2v16M16 5v16"/></svg>;
const IcoFolder   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h6l2 3h8v11a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"/></svg>;
const IcoClip     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2" width="12" height="19" rx="1"/><path d="M9 6h6M9 10h6M9 14h4"/></svg>;
const IcoArrow    = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10h12M11 5l5 5-5 5"/></svg>;
const IcoAlert    = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><path d="M10 6v4M10 14h.01"/></svg>;
const IcoEudr     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>;

interface Land {
  id: number | string;
  land_name: string;
  commodity_name?: string;
  total_area_hectares: number | string;
  has_polygon?: boolean | number;
  polygon_path?: string;
  eudr_status?: string;
  compliance_status?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [lands, setLands]     = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [user, setUser]       = useState<{ full_name?: string; username?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }
    try { const raw = localStorage.getItem("user"); if (raw) setUser(JSON.parse(raw)); } catch {}
    fetchData(token);
  }, []);

  async function fetchData(token: string) {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/proxy/land/index", {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setLands(Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }

  const hasPolygon = (l: Land) =>
    l.has_polygon === 1 || l.has_polygon === true ||
    (l.polygon_path && l.polygon_path !== "[]") ||
    !!localStorage.getItem(`polygon_land_${l.id}`);

  const metrics = useMemo(() => {
    const totalArea = lands.reduce((s, l) => s + (Number(l.total_area_hectares) || 0), 0);
    const withPoly  = lands.filter(hasPolygon).length;
    const compliant = lands.filter(l => ["compliant","verified"].includes((l.eudr_status || l.compliance_status || "").toLowerCase())).length;
    return {
      total: lands.length,
      area: totalArea,
      withPoly,
      compliant,
      rate: lands.length ? Math.round((compliant / lands.length) * 100) : 0,
    };
  }, [lands]);

  // Group lands by commodity for a bar chart
  const byCommodity = useMemo(() => {
    const map: Record<string, number> = {};
    lands.forEach(l => {
      const c = l.commodity_name || "Lainnya";
      map[c] = (map[c] || 0) + (Number(l.total_area_hectares) || 0);
    });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = entries.reduce((m, [, v]) => Math.max(m, v), 0);
    return { entries, max };
  }, [lands]);

  const displayName = user?.full_name || user?.username || "Petani";

  const quickLinks = [
    { label: "Kelola Peta Polygon", desc: "Tambah/edit batas lahan untuk validasi satelit EUDR", path: "/land-polygon", icon: <IcoMap /> },
    { label: "Upload Dokumen Lahan", desc: "Lampirkan sertifikat & dokumen kepatuhan deforestasi", path: "/land-documents", icon: <IcoFolder /> },
    { label: "Siklus Tanam", desc: "Catat aktivitas bibit, perawatan, dan panen", path: "/planting-cycles", icon: <IcoClip /> },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#064e3b 0%,#047857 60%,#10b981 100%)", borderRadius: 14, padding: "24px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>
              Selamat datang, {displayName}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#a7f3d0" }}>
              Pantau status operasional dan kepatuhan EUDR lahan Anda secara real-time.
            </p>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{metrics.rate}%</div>
              <div style={{ fontSize: 11, color: "#a7f3d0" }}>EUDR Rate</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#fff" }}>{metrics.total}</div>
              <div style={{ fontSize: 11, color: "#a7f3d0" }}>Total Lahan</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#b91c1c", fontSize: 13 }}>
          <IcoAlert /> {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b", fontSize: 14 }}>
          Memuat data dashboard...
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── Stat Cards ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
            {[
              { label: "Total Lahan",    value: metrics.total,              unit: "Kavling",    icon: <IcoLand />,   accent: "#064e3b", color: "#0f172a" },
              { label: "Total Luas",     value: `${metrics.area.toFixed(1)}`, unit: "Hektar",  icon: <IcoRuler />,  accent: "#1e40af", color: "#1d4ed8" },
              { label: "Punya Polygon",  value: metrics.withPoly,           unit: "Terpetakan", icon: <IcoMap />,    accent: "#0369a1", color: "#0369a1" },
              { label: "EUDR Compliant", value: metrics.compliant,          unit: "Lahan",      icon: <IcoShield />, accent: "#7e22ce", color: "#7e22ce" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px", borderLeft: `4px solid ${s.accent}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{s.label}</span>
                  <span style={{ color: s.accent }}>{s.icon}</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{s.unit}</div>
              </div>
            ))}
          </div>

          {/* ── Bottom Row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>

            {/* Bar Chart by Commodity */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Luas per Komoditas (Ha)</h3>
              {byCommodity.entries.length === 0 && (
                <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, padding: "24px 0" }}>Belum ada data komoditas.</div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {byCommodity.entries.map(([name, area]) => {
                  const pct = byCommodity.max > 0 ? Math.round((area / byCommodity.max) * 100) : 0;
                  return (
                    <div key={name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                        <span style={{ color: "#374151", fontWeight: 600 }}>{name}</span>
                        <span style={{ color: "#047857", fontWeight: 700 }}>{area.toFixed(1)} Ha</span>
                      </div>
                      <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg,#064e3b,#10b981)", borderRadius: 4, transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Compliance Ring + Quick Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Donut-style compliance */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <svg viewBox="0 0 80 80" width="80" height="80">
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#e2e8f0" strokeWidth="10"/>
                    <circle cx="40" cy="40" r="30" fill="none" stroke="#10b981" strokeWidth="10"
                      strokeDasharray={`${Math.round(188.5 * metrics.rate / 100)} 188.5`}
                      strokeLinecap="round"
                      style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
                    />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#047857" }}>{metrics.rate}%</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Tingkat Kepatuhan EUDR</div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>
                    {metrics.compliant} dari {metrics.total} lahan telah terverifikasi. Target: 100% zero-deforestation.
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                    <span style={{ fontSize: 11, color: "#15803d", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} /> Compliant: {metrics.compliant}
                    </span>
                    <span style={{ fontSize: 11, color: "#b91c1c", fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#fca5a5", display: "inline-block" }} /> Belum: {metrics.total - metrics.compliant}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 20, flex: 1 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#0f172a" }}>Akses Cepat</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {quickLinks.map((q, i) => (
                    <div key={i} onClick={() => router.push(q.path)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", border: "1px solid #f1f5f9", borderRadius: 8, cursor: "pointer", background: "#f8fafc" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "#f0fdf4"; (e.currentTarget as HTMLDivElement).style.borderColor = "#a7f3d0"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; (e.currentTarget as HTMLDivElement).style.borderColor = "#f1f5f9"; }}>
                      <div style={{ color: "#047857", flexShrink: 0 }}>{q.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{q.label}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.desc}</div>
                      </div>
                      <IcoArrow />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── EUDR Info Box ── */}
          <div style={{ background: "#0f172a", borderRadius: 14, padding: "18px 24px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            <div style={{ color: "#38bdf8", flexShrink: 0 }}><IcoEudr /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#38bdf8", letterSpacing: "1px", marginBottom: 4 }}>EUDR MARKET GATE — Zero Deforestation Policy</div>
              <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
                Rantai pasokan Anda harus membuktikan tidak ada deforestasi sejak 31 Desember 2020. Perbarui polygon, unggah dokumen, dan catat siklus tanam agar ekspor ke Eropa tidak terhambat.
              </p>
            </div>
            <div style={{ fontSize: 11, color: "#475569", textAlign: "right", flexShrink: 0 }}>
              <div style={{ color: "#64748b" }}>Standar: <strong style={{ color: "#94a3b8" }}>RSPO & ISPO</strong></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
