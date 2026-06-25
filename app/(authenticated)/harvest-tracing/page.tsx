"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Icons ────────────────────────────────────────────────────────
const IcoTrace   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l4-5 4 4 3-3 3 5"/><path d="M3 15h18M3 19h12"/></svg>;
const IcoPlus    = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" strokeLinecap="round"><path d="M10 3v14M3 10h14"/></svg>;
const IcoShield  = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M10 1.5L2.5 5v5c0 4.5 3.5 8 7.5 9 4-1 7.5-4.5 7.5-9V5L10 1.5z"/></svg>;
const IcoMap     = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4l6-2 6 2 6-2v14l-6 2-6-2-6 2V4z"/></svg>;
const IcoDoc     = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3h7l4 4v11H4V3z"/><path d="M11 3v4h4"/></svg>;
const IcoLeaf    = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17c0-5.5 3.5-9.5 10-11-1.5 5-4 8.5-10 11z"/><path d="M3 17l3-3"/></svg>;
const IcoEye     = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round"><path d="M1.5 10s3.5-6 8.5-6 8.5 6 8.5 6-3.5 6-8.5 6-8.5-6-8.5-6z"/><circle cx="10" cy="10" r="2.5"/></svg>;
const IcoPrint   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="7" width="12" height="9"/><path d="M4 7V3h12v4M7 16h6"/></svg>;
const IcoClose   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round"><path d="M4 4l12 12M16 4L4 16"/></svg>;
const IcoAlert   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><path d="M10 6v4M10 14h.01"/></svg>;
const IcoCheck   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8"/></svg>;
const IcoSpin    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" strokeLinecap="round"><circle cx="12" cy="12" r="10" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></path></svg>;

// ─── Types ────────────────────────────────────────────────────────
interface Land { id: number | string; land_name: string; commodity_name?: string; total_area_hectares?: number | string; has_polygon?: boolean | number; polygon_path?: string; eudr_status?: string; compliance_status?: string; }
interface LandDoc { id: number; document_type?: string; document_name?: string; file_name?: string; status?: string; created_at?: string; }
interface CycleActivity { activity_type?: string; activity_date?: string; }
interface Cycle { id: number; status?: string; start_date?: string; expected_harvest_date?: string; actual_harvest_date?: string; notes?: string; cycle_activities?: CycleActivity[]; }
interface TraceDoc { land: Land; documents: LandDoc[]; cycles: Cycle[]; createdAt: string; }

export default function HarvestTracingPage() {
  const router = useRouter();
  const [lands, setLands]             = useState<Land[]>([]);
  const [landsLoading, setLandsLoading] = useState(true);
  const [selectedLandId, setSelectedLandId] = useState("");
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceError, setTraceError]   = useState("");
  const [traceDoc, setTraceDoc]       = useState<TraceDoc | null>(null);
  const [savedTraces, setSavedTraces] = useState<TraceDoc[]>([]);
  const [showCreate, setShowCreate]   = useState(false);
  const [viewDoc, setViewDoc]         = useState<TraceDoc | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }
    fetchLands(token);
    // Load saved traces from localStorage
    try {
      const raw = localStorage.getItem("harvest_traces");
      if (raw) setSavedTraces(JSON.parse(raw));
    } catch {}
  }, []);

  async function fetchLands(token: string) {
    const tt = "Bearer";
    try {
      const res = await fetch("/api/proxy/land/index", { headers: { Authorization: `${tt} ${token}`, Accept: "application/json" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setLands(Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []));
    } catch {}
    finally { setLandsLoading(false); }
  }

  async function generateTrace() {
    if (!selectedLandId) return;
    setTraceLoading(true); setTraceError(""); setTraceDoc(null);
    const token = localStorage.getItem("access_token") || "";
    const tt    = localStorage.getItem("token_type") || "Bearer";
    const headers = { Authorization: `${tt} ${token}`, Accept: "application/json" };

    try {
      const land = lands.find(l => String(l.id) === selectedLandId)!;

      // Fetch docs & cycles in parallel
      const [docsRes, cyclesRes] = await Promise.all([
        fetch(`/api/proxy/land-document?land_id=${selectedLandId}`, { headers }),
        fetch(`/api/proxy/planting-cycle?land_id=${selectedLandId}`, { headers }),
      ]);

      const docs   = docsRes.ok   ? (await docsRes.json().then(j   => Array.isArray(j)   ? j   : j.data   || [])) : [];
      const cycles = cyclesRes.ok ? (await cyclesRes.json().then(j => Array.isArray(j) ? j : j.data || [])) : [];

      const trace: TraceDoc = { land, documents: docs, cycles, createdAt: new Date().toISOString() };
      setTraceDoc(trace);
    } catch (e: unknown) {
      setTraceError(e instanceof Error ? e.message : "Gagal memuat data.");
    } finally {
      setTraceLoading(false);
    }
  }

  function saveTrace() {
    if (!traceDoc) return;
    const updated = [traceDoc, ...savedTraces];
    setSavedTraces(updated);
    localStorage.setItem("harvest_traces", JSON.stringify(updated));
    setShowCreate(false);
    setTraceDoc(null);
    setSelectedLandId("");
  }

  function deleteTrace(i: number) {
    const updated = savedTraces.filter((_, idx) => idx !== i);
    setSavedTraces(updated);
    localStorage.setItem("harvest_traces", JSON.stringify(updated));
  }

  const hasPolygon = (l: Land) =>
    l.has_polygon === 1 || l.has_polygon === true ||
    (l.polygon_path && l.polygon_path !== "[]") ||
    !!localStorage.getItem(`polygon_land_${l.id}`);
  const eudrStatus = (l: Land) => {
    const raw = (l.eudr_status || l.compliance_status || (hasPolygon(l) ? "compliant" : "pending")).toLowerCase();
    if (["compliant","verified"].includes(raw)) return { label: "Verified", bg: "#dcfce7", color: "#15803d" };
    if (raw === "pending") return { label: "Pending Review", bg: "#fef3c7", color: "#b45309" };
    return { label: "Non-Compliant", bg: "#fee2e2", color: "#b91c1c" };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#064e3b 0%,#047857 60%,#10b981 100%)", borderRadius: 14, padding: "24px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <IcoTrace />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>Harvest Tracing</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#a7f3d0" }}>Dokumen penelusuran hasil panen untuk kepatuhan ekspor EUDR</p>
            </div>
          </div>
          <button onClick={() => { setTraceDoc(null); setSelectedLandId(""); setTraceError(""); setShowCreate(true); }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 8, border: "none", background: "#fff", color: "#047857", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <IcoPlus /> Buat Trace Baru
          </button>
        </div>
      </div>

      {/* ── Saved Traces List ── */}
      {savedTraces.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ color: "#94a3b8", marginBottom: 8 }}><IcoTrace /></div>
          <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Belum ada dokumen trace. Klik <strong>Buat Trace Baru</strong> untuk memulai.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 600 }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#064e3b,#047857)" }}>
                {["#", "Lahan", "Komoditas", "EUDR Status", "Dokumen", "Siklus", "Dibuat", "Aksi"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", color: "#a7f3d0", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {savedTraces.map((t, i) => {
                const eu = eudrStatus(t.land);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", color: "#94a3b8" }}>{i + 1}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>{t.land.land_name}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ padding: "3px 8px", borderRadius: 20, background: "#e6f4ea", color: "#065f46", fontSize: 11, fontWeight: 600 }}>{t.land.commodity_name || "—"}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ padding: "3px 9px", borderRadius: 6, background: eu.bg, color: eu.color, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <IcoShield /> {eu.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#047857", fontWeight: 700 }}>{t.documents.length}</td>
                    <td style={{ padding: "12px 14px", color: "#1d4ed8", fontWeight: 700 }}>{t.cycles.length}</td>
                    <td style={{ padding: "12px 14px", color: "#64748b", fontSize: 12 }}>{new Date(t.createdAt).toLocaleDateString("id-ID")}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setViewDoc(t)}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: "1px solid #e2e8f0", background: "#fff", borderRadius: 7, cursor: "pointer", fontSize: 12, color: "#374151" }}>
                          <IcoEye /> Lihat
                        </button>
                        <button onClick={() => deleteTrace(i)}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: "1px solid #fee2e2", background: "#fff5f5", borderRadius: 7, cursor: "pointer", fontSize: 12, color: "#b91c1c" }}>
                          <IcoClose />
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

      {/* ── Create Trace Modal ── */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20, overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, maxWidth: 640, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Buat Dokumen Trace Baru</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><IcoClose /></button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Pilih Lahan *</label>
              <select value={selectedLandId} onChange={e => { setSelectedLandId(e.target.value); setTraceDoc(null); setTraceError(""); }}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, background: "#fff", outline: "none" }}
                disabled={landsLoading}>
                <option value="">{landsLoading ? "Memuat lahan..." : "-- Pilih lahan --"}</option>
                {lands.map(l => (
                  <option key={l.id} value={String(l.id)}>{l.land_name} {l.commodity_name ? `(${l.commodity_name})` : ""}</option>
                ))}
              </select>
            </div>

            <button onClick={generateTrace} disabled={!selectedLandId || traceLoading}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8, border: "none", background: selectedLandId ? "linear-gradient(135deg,#064e3b,#10b981)" : "#e2e8f0", color: selectedLandId ? "#fff" : "#94a3b8", cursor: selectedLandId && !traceLoading ? "pointer" : "not-allowed", fontSize: 13, fontWeight: 700 }}>
              {traceLoading ? <IcoSpin /> : <IcoTrace />}
              {traceLoading ? "Mengumpulkan data..." : "Generate Trace Document"}
            </button>

            {traceError && (
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#b91c1c", fontSize: 13 }}>
                <IcoAlert /> {traceError}
              </div>
            )}

            {/* Preview */}
            {traceDoc && (
              <div style={{ marginTop: 18, border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ background: "linear-gradient(135deg,#064e3b,#047857)", padding: "14px 18px", color: "#fff" }}>
                  <div style={{ fontSize: 12, color: "#a7f3d0", fontWeight: 700, letterSpacing: "1px", marginBottom: 2 }}>RINGKASAN TRACE DOCUMENT</div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{traceDoc.land.land_name}</div>
                </div>
                <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[
                    { icon: <IcoShield />, label: "EUDR Status", value: eudrStatus(traceDoc.land).label, color: eudrStatus(traceDoc.land).color },
                    { icon: <IcoMap />,    label: "Polygon",    value: hasPolygon(traceDoc.land) ? "Terpetakan" : "Belum Ada", color: hasPolygon(traceDoc.land) ? "#047857" : "#b91c1c" },
                    { icon: <IcoDoc />,    label: "Dokumen",    value: `${traceDoc.documents.length} file`, color: "#1d4ed8" },
                    { icon: <IcoLeaf />,   label: "Siklus Tanam", value: `${traceDoc.cycles.length} siklus`, color: "#7c3aed" },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: "10px 12px", border: "1px solid #f1f5f9", borderRadius: 8, background: "#f8fafc" }}>
                      <div style={{ color: "#64748b", marginBottom: 4 }}>{s.icon}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10 }}>
                  <button onClick={saveTrace}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: 10, background: "linear-gradient(135deg,#064e3b,#10b981)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                    <IcoCheck /> Simpan Trace Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── View Trace Document Modal ── */}
      {viewDoc && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20, overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 14, maxWidth: 680, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.2)", overflow: "hidden" }}>
            {/* Doc Header */}
            <div style={{ background: "linear-gradient(135deg,#064e3b,#047857)", padding: "20px 24px", color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#a7f3d0", fontWeight: 700, letterSpacing: "1px", marginBottom: 4 }}>EUDR HARVEST TRACING DOCUMENT</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{viewDoc.land.land_name}</div>
                  <div style={{ fontSize: 13, color: "#a7f3d0", marginTop: 2 }}>
                    {viewDoc.land.commodity_name || "—"} · {viewDoc.land.total_area_hectares} Ha
                  </div>
                </div>
                <button onClick={() => setViewDoc(null)} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", color: "#fff" }}><IcoClose /></button>
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: "#a7f3d0" }}>Dibuat: {new Date(viewDoc.createdAt).toLocaleString("id-ID")}</span>
                {(() => { const eu = eudrStatus(viewDoc.land); return <span style={{ padding: "3px 10px", borderRadius: 6, background: eu.bg, color: eu.color, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><IcoShield /> {eu.label}</span>; })()}
              </div>
            </div>

            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Section 1: Land Info */}
              <Section title="Informasi Lahan" icon={<IcoMap />}>
                <InfoRow label="Nama Lahan" value={viewDoc.land.land_name} />
                <InfoRow label="Komoditas" value={viewDoc.land.commodity_name || "—"} />
                <InfoRow label="Luas" value={`${viewDoc.land.total_area_hectares} Ha`} />
                <InfoRow label="Status Polygon" value={hasPolygon(viewDoc.land) ? "Terpetakan (koordinat tersedia)" : "Belum ada polygon"} />
                <InfoRow label="EUDR Compliance" value={eudrStatus(viewDoc.land).label} />
              </Section>

              {/* Section 2: Documents */}
              <Section title={`Dokumen Lahan (${viewDoc.documents.length})`} icon={<IcoDoc />}>
                {viewDoc.documents.length === 0
                  ? <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Belum ada dokumen yang diunggah.</p>
                  : viewDoc.documents.map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < viewDoc.documents.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{d.document_name || d.file_name || `Dokumen #${i+1}`}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{d.document_type || "—"}</div>
                      </div>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: d.status === "verified" ? "#dcfce7" : "#fef3c7", color: d.status === "verified" ? "#15803d" : "#b45309", fontWeight: 700, alignSelf: "flex-start" }}>
                        {d.status === "verified" ? "Verified" : d.status || "Pending"}
                      </span>
                    </div>
                  ))
                }
              </Section>

              {/* Section 3: Planting Cycles */}
              <Section title={`Siklus Tanam (${viewDoc.cycles.length})`} icon={<IcoLeaf />}>
                {viewDoc.cycles.length === 0
                  ? <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Belum ada siklus tanam tercatat.</p>
                  : viewDoc.cycles.map((c, i) => (
                    <div key={i} style={{ padding: "8px 0", borderBottom: i < viewDoc.cycles.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>Mulai: <strong>{c.start_date || "—"}</strong> · Target Panen: <strong>{c.expected_harvest_date || "—"}</strong></div>
                          {c.notes && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{c.notes}</div>}
                        </div>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: c.status === "panen" || c.status === "selesai" ? "#dcfce7" : "#fef3c7", color: c.status === "panen" || c.status === "selesai" ? "#15803d" : "#b45309", fontWeight: 700, whiteSpace: "nowrap" }}>
                          {c.status || "bibit"}
                        </span>
                      </div>
                      {c.cycle_activities && c.cycle_activities.length > 0 && (
                        <div style={{ marginTop: 6, fontSize: 11, color: "#94a3b8" }}>
                          {c.cycle_activities.length} aktivitas tercatat
                        </div>
                      )}
                    </div>
                  ))
                }
              </Section>

              {/* Footer */}
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>
                Dokumen ini dibuat secara otomatis oleh sistem Agrantara sebagai bukti penelusuran rantai pasokan sesuai persyaratan Regulasi EUDR (EU) 2023/1115. Data mencakup informasi spasial polygon, dokumen kepatuhan, dan catatan siklus tanam yang terdaftar pada sistem.
              </div>

              <button onClick={() => window.print()}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#374151" }}>
                <IcoPrint /> Cetak / Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper Components ─────────────────────────────────────────────
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "10px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#047857" }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{title}</span>
      </div>
      <div style={{ padding: "12px 16px" }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f8fafc", fontSize: 13 }}>
      <span style={{ color: "#64748b" }}>{label}</span>
      <span style={{ fontWeight: 600, color: "#0f172a" }}>{value}</span>
    </div>
  );
}
