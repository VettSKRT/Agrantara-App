"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Icons ────────────────────────────────────────────────────────
const IcoTrace  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l4-5 4 4 3-3 3 5"/><path d="M3 15h18M3 19h12"/></svg>;
const IcoPlus   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" strokeLinecap="round"><path d="M10 3v14M3 10h14"/></svg>;
const IcoShield = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M10 1.5L2.5 5v5c0 4.5 3.5 8 7.5 9 4-1 7.5-4.5 7.5-9V5L10 1.5z"/></svg>;
const IcoMap    = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4l6-2 6 2 6-2v14l-6 2-6-2-6 2V4z"/></svg>;
const IcoDoc    = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3h7l4 4v11H4V3z"/><path d="M11 3v4h4"/></svg>;
const IcoLeaf   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17c0-5.5 3.5-9.5 10-11-1.5 5-4 8.5-10 11z"/><path d="M3 17l3-3"/></svg>;
const IcoEye    = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round"><path d="M1.5 10s3.5-6 8.5-6 8.5 6 8.5 6-3.5 6-8.5 6-8.5-6-8.5-6z"/><circle cx="10" cy="10" r="2.5"/></svg>;
const IcoPrint  = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="7" width="12" height="9"/><path d="M4 7V3h12v4M7 16h6"/></svg>;
const IcoClose  = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round"><path d="M4 4l12 12M16 4L4 16"/></svg>;
const IcoAlert  = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15" strokeLinecap="round"><circle cx="10" cy="10" r="8"/><path d="M10 6v4M10 14h.01"/></svg>;
const IcoCheck  = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8"/></svg>;
const IcoSpin   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" strokeLinecap="round"><circle cx="12" cy="12" r="10" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/></path></svg>;

// ─── Types ────────────────────────────────────────────────────────
interface Land { id: number | string; land_name: string; commodity_name?: string; total_area_hectares?: number | string; has_polygon?: boolean | number; polygon_path?: string; eudr_status?: string; compliance_status?: string; }
interface LandDoc { id: number | string; land_id?: number | string; document_type?: string; document_name?: string; file_name?: string; file_url?: string; description?: string; status?: string; created_at?: string; }
interface CycleActivity { activity_type?: string; activity_date?: string; }
interface Cycle { id: number | string; status?: string; start_date?: string; expected_harvest_date?: string; actual_harvest_date?: string; notes?: string; cycle_activities?: CycleActivity[]; }
interface TraceDoc { land: Land; documents: LandDoc[]; cycles: Cycle[]; createdAt: string; }

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
          position: "absolute", right: 13, top: "50%",
          transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
          transition: "transform 0.2s", color: "#64748b", fontSize: 10, lineHeight: 1,
        }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: 12,
          boxShadow: "0 12px 40px rgba(0,0,0,0.14)", zIndex: 600, maxHeight: 260, overflowY: "auto",
        }}>
          {options.map((opt, i) => (
            <div key={i} onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: "11px 14px", cursor: "pointer", fontSize: 14,
                color: opt.value === value ? "#047857" : "#374151",
                background: opt.value === value ? "#f0fdf4" : "#fff",
                fontWeight: opt.value === value ? 600 : 400,
                borderBottom: i < options.length - 1 ? "1px solid #f8fafc" : "none",
                display: "flex", alignItems: "center", gap: 10,
              }}
              onMouseEnter={e => { if (opt.value !== value) (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = opt.value === value ? "#f0fdf4" : "#fff"; }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: "50%",
                border: `2px solid ${opt.value === value ? "#10b981" : "#d1d5db"}`,
                background: opt.value === value ? "#10b981" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
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

// ─── Helpers ──────────────────────────────────────────────────────
function hasPolygon(l: Land) {
  return l.has_polygon === 1 || l.has_polygon === true ||
    (l.polygon_path && l.polygon_path !== "[]") ||
    !!(typeof window !== "undefined" && localStorage.getItem(`polygon_land_${l.id}`));
}

function eudrStatus(l: Land) {
  const raw = (l.eudr_status || l.compliance_status || (hasPolygon(l) ? "compliant" : "pending")).toLowerCase();
  if (["compliant", "verified"].includes(raw)) return { label: "Verified", bg: "#dcfce7", color: "#15803d" };
  if (raw === "pending") return { label: "Pending Review", bg: "#fef3c7", color: "#b45309" };
  return { label: "Non-Compliant", bg: "#fee2e2", color: "#b91c1c" };
}

function printTrace(doc: TraceDoc) {
  const poly = hasPolygon(doc.land);
  const eu = eudrStatus(doc.land);

  const euClass = eu.label === "Verified" ? "verified" : eu.label === "Pending Review" ? "pending" : "noncompliant";

  const docsHTML = doc.documents.length === 0
    ? '<p style="color:#94a3b8;font-size:13px;margin:0">Belum ada dokumen yang diunggah.</p>'
    : doc.documents.map((d, i) => `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:9px 0;border-bottom:${i < doc.documents.length - 1 ? "1px solid #f1f5f9" : "none"}">
          <div>
            <div style="font-size:13px;font-weight:600;color:#0f172a">${d.document_type || d.document_name || `Dokumen #${i + 1}`}</div>
            <div style="font-size:11px;color:#64748b;margin-top:2px">${d.file_name || d.description || ""}</div>
          </div>
          <span style="font-size:11px;padding:2px 9px;border-radius:5px;font-weight:700;${d.status === "verified" || d.status === "approved" ? "background:#dcfce7;color:#15803d" : "background:#fef3c7;color:#b45309"}">${d.status || "Pending"}</span>
        </div>`).join("");

  const cyclesHTML = doc.cycles.length === 0
    ? '<p style="color:#94a3b8;font-size:13px;margin:0">Belum ada siklus tanam tercatat.</p>'
    : doc.cycles.map((c, i) => `
        <div style="padding:9px 0;border-bottom:${i < doc.cycles.length - 1 ? "1px solid #f1f5f9" : "none"}">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <div style="font-size:13px;font-weight:600;color:#0f172a">Siklus Tanam ${i + 1}</div>
              <div style="font-size:11px;color:#64748b;margin-top:2px">
                Mulai: ${c.start_date || "—"} · Target Panen: ${c.expected_harvest_date || "—"}
                ${c.notes ? `<br>${c.notes}` : ""}
              </div>
            </div>
            <span style="font-size:11px;padding:2px 9px;border-radius:5px;font-weight:700;${["panen","selesai"].includes(c.status || "") ? "background:#dcfce7;color:#15803d" : "background:#fef3c7;color:#b45309"}">${c.status || "bibit"}</span>
          </div>
          ${c.cycle_activities && c.cycle_activities.length > 0 ? `<div style="font-size:11px;color:#94a3b8;margin-top:4px">${c.cycle_activities.length} aktivitas tercatat</div>` : ""}
        </div>`).join("");

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>EUDR Harvest Tracing — ${doc.land.land_name}</title>
<style>
@page { margin: 0; size: A4; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; font-size: 13px; line-height: 1.6; padding: 1.4cm 1.5cm; }
.hdr { background: linear-gradient(135deg,#064e3b,#047857); color: white; padding: 22px 24px; border-radius: 10px; margin-bottom: 18px; }
.hdr-label { font-size: 10px; color: #a7f3d0; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
.hdr-title { font-size: 20px; font-weight: 800; }
.hdr-sub { font-size: 12px; color: #a7f3d0; margin-top: 3px; }
.hdr-meta { display: flex; gap: 14px; margin-top: 12px; font-size: 11px; color: #d1fae5; align-items: center; flex-wrap: wrap; }
.badge { display: inline-block; padding: 3px 9px; border-radius: 5px; font-size: 11px; font-weight: 700; }
.badge.verified { background: #dcfce7; color: #15803d; }
.badge.pending { background: #fef3c7; color: #b45309; }
.badge.noncompliant { background: #fee2e2; color: #b91c1c; }
.stats { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; margin-bottom: 18px; }
.stat { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; }
.stat-label { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
.stat-val { font-size: 17px; font-weight: 800; }
.section { border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 14px; overflow: hidden; }
.sec-head { background: #f8fafc; padding: 9px 14px; border-bottom: 1px solid #e2e8f0; font-size: 12px; font-weight: 700; color: #374151; }
.sec-body { padding: 12px 14px; }
.info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; }
.info-row:last-child { border-bottom: none; }
.info-row .lbl { color: #64748b; }
.info-row .val { font-weight: 600; color: #0f172a; }
.footer { margin-top: 16px; padding: 12px 14px; background: #f8fafc; border-radius: 8px; font-size: 10px; color: #64748b; line-height: 1.7; border: 1px solid #e2e8f0; }
.wm { text-align: center; margin-top: 14px; font-size: 10px; color: #94a3b8; }
</style>
</head>
<body>
<div class="hdr">
  <div class="hdr-label">EUDR Harvest Tracing Document — Agrantara</div>
  <div class="hdr-title">${doc.land.land_name}</div>
  <div class="hdr-sub">${doc.land.commodity_name || "—"} &nbsp;·&nbsp; ${doc.land.total_area_hectares || "—"} Ha</div>
  <div class="hdr-meta">
    <span>Dibuat: ${new Date(doc.createdAt).toLocaleString("id-ID")}</span>
    <span class="badge ${euClass}">${eu.label}</span>
  </div>
</div>

<div class="stats">
  <div class="stat"><div class="stat-label">EUDR Status</div><div class="stat-val" style="color:${eu.color}">${eu.label}</div></div>
  <div class="stat"><div class="stat-label">Polygon Lahan</div><div class="stat-val" style="color:${poly ? "#047857" : "#b91c1c"}">${poly ? "Terpetakan" : "Belum Ada"}</div></div>
  <div class="stat"><div class="stat-label">Dokumen</div><div class="stat-val" style="color:#1d4ed8">${doc.documents.length} file</div></div>
  <div class="stat"><div class="stat-label">Siklus Tanam</div><div class="stat-val" style="color:#7c3aed">${doc.cycles.length} siklus</div></div>
</div>

<div class="section">
  <div class="sec-head">📍 Informasi Lahan</div>
  <div class="sec-body">
    <div class="info-row"><span class="lbl">Nama Lahan</span><span class="val">${doc.land.land_name}</span></div>
    <div class="info-row"><span class="lbl">Komoditas</span><span class="val">${doc.land.commodity_name || "—"}</span></div>
    <div class="info-row"><span class="lbl">Luas</span><span class="val">${doc.land.total_area_hectares || "—"} Ha</span></div>
    <div class="info-row"><span class="lbl">Status Polygon</span><span class="val">${poly ? "Terpetakan (koordinat tersedia)" : "Belum ada polygon"}</span></div>
    <div class="info-row"><span class="lbl">EUDR Compliance</span><span class="val"><span class="badge ${euClass}">${eu.label}</span></span></div>
  </div>
</div>

<div class="section">
  <div class="sec-head">📄 Dokumen Lahan (${doc.documents.length} file)</div>
  <div class="sec-body">${docsHTML}</div>
</div>

<div class="section">
  <div class="sec-head">🌱 Siklus Tanam (${doc.cycles.length} siklus)</div>
  <div class="sec-body">${cyclesHTML}</div>
</div>

<div class="footer">
  Dokumen ini dibuat secara otomatis oleh sistem <strong>Agrantara</strong> sebagai bukti penelusuran rantai pasokan sesuai persyaratan Regulasi EUDR (EU) 2023/1115. Data mencakup informasi spasial polygon, dokumen kepatuhan, dan catatan siklus tanam yang terdaftar pada sistem.
</div>
<div class="wm">© Agrantara — EUDR Farmer Compliance Platform &nbsp;·&nbsp; ${new Date(doc.createdAt).toLocaleString("id-ID")}</div>
</body></html>`;

  // Hidden iframe — print without opening a new tab/window
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:0;opacity:0;";
  document.body.appendChild(iframe);
  const iwin = iframe.contentWindow;
  if (!iwin) { document.body.removeChild(iframe); return; }
  iwin.document.open();
  iwin.document.write(html);
  iwin.document.close();
  setTimeout(() => {
    iwin.focus();
    iwin.print();
    setTimeout(() => { if (document.body.contains(iframe)) document.body.removeChild(iframe); }, 2000);
  }, 400);
}

// ─── Main Page ────────────────────────────────────────────────────
export default function HarvestTracingPage() {
  const router = useRouter();
  const [lands, setLands] = useState<Land[]>([]);
  const [landsLoading, setLandsLoading] = useState(true);
  const [selectedLandId, setSelectedLandId] = useState("");
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceError, setTraceError] = useState("");
  const [traceDoc, setTraceDoc] = useState<TraceDoc | null>(null);
  const [savedTraces, setSavedTraces] = useState<TraceDoc[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [viewDoc, setViewDoc] = useState<TraceDoc | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }
    fetchLands(token);
    try {
      const raw = localStorage.getItem("harvest_traces");
      if (raw) setSavedTraces(JSON.parse(raw));
    } catch {}
  }, []);

  async function fetchLands(token: string) {
    try {
      const res = await fetch("/api/proxy/land/index", { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" } });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setLands(Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []));
    } catch {}
    finally { setLandsLoading(false); }
  }

  async function generateTrace() {
    if (!selectedLandId) return;
    setTraceLoading(true); setTraceError(""); setTraceDoc(null);
    const token = localStorage.getItem("access_token") || "";
    const tt = localStorage.getItem("token_type") || "Bearer";
    const headers = { Authorization: `${tt} ${token}`, Accept: "application/json" };

    try {
      const land = lands.find(l => String(l.id) === selectedLandId)!;

      const [docsRes, cyclesRes] = await Promise.all([
        fetch(`/api/proxy/land-document?land_id=${selectedLandId}`, { headers }).catch(() => null),
        fetch(`/api/proxy/planting-cycle?land_id=${selectedLandId}`, { headers }).catch(() => null),
      ]);

      let docs: LandDoc[] = [];
      let cycles: Cycle[] = [];

      if (docsRes?.ok) {
        const j = await docsRes.json().catch(() => null);
        docs = j ? (Array.isArray(j) ? j : (j.data || [])) : [];
      }
      if (cyclesRes?.ok) {
        const j = await cyclesRes.json().catch(() => null);
        cycles = j ? (Array.isArray(j) ? j : (j.data || [])) : [];
      }

      // Fall back to localStorage if API returned nothing
      if (docs.length === 0) {
        try {
          const localDocs: LandDoc[] = JSON.parse(localStorage.getItem("local_land_documents") || "[]");
          docs = localDocs.filter(d => String(d.land_id) === selectedLandId);
        } catch {}
      }
      if (cycles.length === 0) {
        try {
          const localCycles: Cycle[] = JSON.parse(localStorage.getItem("local_planting_cycles") || "[]");
          cycles = (localCycles as Array<Cycle & { land_id: string | number }>).filter(c => String(c.land_id) === selectedLandId);
        } catch {}
      }

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
    // Strip base64 file_url before saving — avoids localStorage quota exceeded
    const sanitized: TraceDoc = {
      ...traceDoc,
      documents: traceDoc.documents.map(d => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { file_url, ...rest } = d as LandDoc & { file_url?: string };
        return rest as LandDoc;
      }),
    };
    const updated = [sanitized, ...savedTraces];
    setSavedTraces(updated);
    try {
      localStorage.setItem("harvest_traces", JSON.stringify(updated));
    } catch {
      // Quota still exceeded — keep only the 5 most recent
      const trimmed = updated.slice(0, 5);
      try { localStorage.setItem("harvest_traces", JSON.stringify(trimmed)); } catch {}
      setSavedTraces(trimmed);
    }
    setShowCreate(false); setTraceDoc(null); setSelectedLandId("");
  }

  function deleteTrace(i: number) {
    const updated = savedTraces.filter((_, idx) => idx !== i);
    setSavedTraces(updated);
    localStorage.setItem("harvest_traces", JSON.stringify(updated));
  }

  const [refreshingIdx, setRefreshingIdx] = useState<number | null>(null);

  async function refreshTrace(idx: number) {
    const existing = savedTraces[idx];
    const landId = String(existing.land.id);
    setRefreshingIdx(idx);
    const token = localStorage.getItem("access_token") || "";
    const tt = localStorage.getItem("token_type") || "Bearer";
    const headers = { Authorization: `${tt} ${token}`, Accept: "application/json" };
    try {
      const [docsRes, cyclesRes] = await Promise.all([
        fetch(`/api/proxy/land-document?land_id=${landId}`, { headers }).catch(() => null),
        fetch(`/api/proxy/planting-cycle?land_id=${landId}`, { headers }).catch(() => null),
      ]);
      let docs: LandDoc[] = [];
      let cycles: Cycle[] = [];
      if (docsRes?.ok) { const j = await docsRes.json().catch(() => null); docs = j ? (Array.isArray(j) ? j : (j.data || [])) : []; }
      if (cyclesRes?.ok) { const j = await cyclesRes.json().catch(() => null); cycles = j ? (Array.isArray(j) ? j : (j.data || [])) : []; }
      if (docs.length === 0) {
        try { const local: LandDoc[] = JSON.parse(localStorage.getItem("local_land_documents") || "[]"); docs = local.filter(d => String(d.land_id) === landId); } catch {}
      }
      if (cycles.length === 0) {
        try { const local = JSON.parse(localStorage.getItem("local_planting_cycles") || "[]") as Array<Cycle & { land_id: string | number }>; cycles = local.filter(c => String(c.land_id) === landId); } catch {}
      }
      const refreshed: TraceDoc = {
        ...existing,
        documents: docs.map(d => { const { file_url, ...rest } = d as LandDoc & { file_url?: string }; return rest as LandDoc; }),
        cycles,
        createdAt: new Date().toISOString(),
      };
      const updated = savedTraces.map((t, i) => i === idx ? refreshed : t);
      setSavedTraces(updated);
      try { localStorage.setItem("harvest_traces", JSON.stringify(updated)); } catch {}
    } catch {}
    finally { setRefreshingIdx(null); }
  }

  const landOptions = lands.map(l => ({
    value: String(l.id),
    label: l.land_name + (l.commodity_name ? ` (${l.commodity_name})` : ""),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Hero */}
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
          <button
            onClick={() => { setTraceDoc(null); setSelectedLandId(""); setTraceError(""); setShowCreate(true); }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 8, border: "none", background: "#fff", color: "#047857", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <IcoPlus /> Buat Trace Baru
          </button>
        </div>
      </div>

      {/* Saved Traces */}
      {savedTraces.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "48px 24px", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#10b981" }}>
            <IcoTrace />
          </div>
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
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
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
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontWeight: 700, color: t.documents.length > 0 ? "#047857" : "#94a3b8" }}>{t.documents.length}</span>
                      {t.documents.length > 0 && <span style={{ fontSize: 11, color: "#64748b", marginLeft: 4 }}>file</span>}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontWeight: 700, color: t.cycles.length > 0 ? "#1d4ed8" : "#94a3b8" }}>{t.cycles.length}</span>
                      {t.cycles.length > 0 && <span style={{ fontSize: 11, color: "#64748b", marginLeft: 4 }}>siklus</span>}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#64748b", fontSize: 12 }}>{new Date(t.createdAt).toLocaleDateString("id-ID")}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button onClick={() => setViewDoc(t)}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: "1px solid #e2e8f0", background: "#fff", borderRadius: 7, cursor: "pointer", fontSize: 12, color: "#374151" }}>
                          <IcoEye /> Lihat
                        </button>
                        <button
                          onClick={() => refreshTrace(i)}
                          disabled={refreshingIdx === i}
                          title="Perbarui dokumen & siklus tanam dari data terkini"
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: "1px solid #bbf7d0", background: refreshingIdx === i ? "#f0fdf4" : "#f0fdf4", borderRadius: 7, cursor: refreshingIdx === i ? "wait" : "pointer", fontSize: 12, color: "#047857", opacity: refreshingIdx === i ? 0.7 : 1 }}>
                          {refreshingIdx === i ? "⟳ Memperbarui..." : "⟳ Perbarui"}
                        </button>
                        <button onClick={() => printTrace(t)}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", border: "1px solid #bfdbfe", background: "#eff6ff", borderRadius: 7, cursor: "pointer", fontSize: 12, color: "#2563eb" }}>
                          <IcoPrint />
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

      {/* Create Trace Modal */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20, overflowY: "auto" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 640, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #f1f5f9", paddingBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Buat Dokumen Trace Baru</h3>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>Pilih lahan, lalu generate trace dari data dokumen & siklus tanam</p>
              </div>
              <button onClick={() => setShowCreate(false)} style={{ background: "#f8fafc", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}><IcoClose /></button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Pilih Lahan *</label>
              <CustomSelect
                value={selectedLandId}
                onChange={v => { setSelectedLandId(v); setTraceDoc(null); setTraceError(""); }}
                options={landOptions}
                placeholder={landsLoading ? "Memuat lahan..." : "-- Pilih lahan --"}
                disabled={landsLoading}
              />
            </div>

            <button onClick={generateTrace} disabled={!selectedLandId || traceLoading}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 20px", borderRadius: 10, border: "none", background: selectedLandId && !traceLoading ? "linear-gradient(135deg,#064e3b,#10b981)" : "#e2e8f0", color: selectedLandId && !traceLoading ? "#fff" : "#94a3b8", cursor: selectedLandId && !traceLoading ? "pointer" : "not-allowed", fontSize: 14, fontWeight: 700, boxShadow: selectedLandId && !traceLoading ? "0 2px 8px rgba(16,185,129,0.3)" : "none", transition: "all 0.2s" }}>
              {traceLoading ? <IcoSpin /> : <IcoTrace />}
              {traceLoading ? "Mengumpulkan data..." : "Generate Trace Document"}
            </button>

            {traceError && (
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#b91c1c", fontSize: 13 }}>
                <IcoAlert /> {traceError}
              </div>
            )}

            {traceDoc && (
              <div style={{ marginTop: 18, border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ background: "linear-gradient(135deg,#064e3b,#047857)", padding: "14px 18px", color: "#fff" }}>
                  <div style={{ fontSize: 11, color: "#a7f3d0", fontWeight: 700, letterSpacing: "1px", marginBottom: 2, textTransform: "uppercase" }}>Ringkasan Trace Document</div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{traceDoc.land.land_name}</div>
                  <div style={{ fontSize: 12, color: "#a7f3d0", marginTop: 2 }}>{traceDoc.land.commodity_name || "—"} · {traceDoc.land.total_area_hectares} Ha</div>
                </div>
                <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                  {[
                    { icon: <IcoShield />, label: "EUDR Status", value: eudrStatus(traceDoc.land).label, color: eudrStatus(traceDoc.land).color },
                    { icon: <IcoMap />, label: "Polygon", value: hasPolygon(traceDoc.land) ? "Terpetakan" : "Belum Ada", color: hasPolygon(traceDoc.land) ? "#047857" : "#b91c1c" },
                    { icon: <IcoDoc />, label: "Dokumen", value: `${traceDoc.documents.length} file`, color: "#1d4ed8" },
                    { icon: <IcoLeaf />, label: "Siklus Tanam", value: `${traceDoc.cycles.length} siklus`, color: "#7c3aed" },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: "10px 12px", border: "1px solid #f1f5f9", borderRadius: 10, background: "#f8fafc" }}>
                      <div style={{ color: "#64748b", marginBottom: 4 }}>{s.icon}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                {traceDoc.documents.length === 0 && traceDoc.cycles.length === 0 && (
                  <div style={{ padding: "10px 16px", fontSize: 12, color: "#b45309", background: "#fef3c7", margin: "0 16px 14px", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <IcoAlert /> Tidak ada dokumen & siklus tanam ditemukan untuk lahan ini. Tambahkan terlebih dahulu di menu Land Documents dan Planting Cycles.
                  </div>
                )}
                <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10 }}>
                  <button onClick={saveTrace}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: 11, background: "linear-gradient(135deg,#064e3b,#10b981)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                    <IcoCheck /> Simpan Trace Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Trace Document Modal — overlay scrolls, modal has no height cap */}
      {viewDoc && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.7)", zIndex: 999, overflow: "auto", padding: "20px 16px" }}
          onClick={e => { if (e.target === e.currentTarget) setViewDoc(null); }}
        >
          <div style={{ background: "#fff", borderRadius: 16, maxWidth: 700, width: "100%", margin: "0 auto", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>

            {/* Header */}
            <div style={{ background: "linear-gradient(135deg,#064e3b,#047857)", padding: "20px 24px", color: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 10, color: "#a7f3d0", fontWeight: 700, letterSpacing: "1.5px", marginBottom: 4, textTransform: "uppercase" }}>EUDR Harvest Tracing Document</div>
                  <div style={{ fontSize: 19, fontWeight: 800 }}>{viewDoc.land.land_name}</div>
                  <div style={{ fontSize: 13, color: "#a7f3d0", marginTop: 2 }}>{viewDoc.land.commodity_name || "—"} · {viewDoc.land.total_area_hectares} Ha</div>
                </div>
                <button onClick={() => setViewDoc(null)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IcoClose />
                </button>
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#a7f3d0" }}>Dibuat: {new Date(viewDoc.createdAt).toLocaleString("id-ID")}</span>
                {(() => { const eu = eudrStatus(viewDoc.land); return <span style={{ padding: "3px 10px", borderRadius: 6, background: eu.bg, color: eu.color, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><IcoShield /> {eu.label}</span>; })()}
              </div>
            </div>

            {/* Body — no height cap, no overflow hidden, all content visible */}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                {[
                  { icon: <IcoShield />, label: "EUDR Status", value: eudrStatus(viewDoc.land).label, color: eudrStatus(viewDoc.land).color },
                  { icon: <IcoMap />, label: "Polygon", value: hasPolygon(viewDoc.land) ? "Terpetakan" : "Belum Ada", color: hasPolygon(viewDoc.land) ? "#047857" : "#b91c1c" },
                  { icon: <IcoDoc />, label: "Dokumen", value: `${viewDoc.documents.length} file`, color: "#1d4ed8" },
                  { icon: <IcoLeaf />, label: "Siklus Tanam", value: `${viewDoc.cycles.length} siklus`, color: "#7c3aed" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: "10px 12px", border: "1px solid #f1f5f9", borderRadius: 10, background: "#f8fafc", textAlign: "center" }}>
                    <div style={{ color: "#94a3b8", marginBottom: 4, display: "flex", justifyContent: "center" }}>{s.icon}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" }}>{s.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <Section title="Informasi Lahan" icon={<IcoMap />}>
                <InfoRow label="Nama Lahan" value={viewDoc.land.land_name} />
                <InfoRow label="Komoditas" value={viewDoc.land.commodity_name || "—"} />
                <InfoRow label="Luas" value={`${viewDoc.land.total_area_hectares} Ha`} />
                <InfoRow label="Status Polygon" value={hasPolygon(viewDoc.land) ? "Terpetakan (koordinat tersedia)" : "Belum ada polygon"} />
                <InfoRow label="EUDR Compliance" value={eudrStatus(viewDoc.land).label} />
              </Section>

              <Section title={`Dokumen Lahan (${viewDoc.documents.length} file)`} icon={<IcoDoc />}>
                {viewDoc.documents.length === 0
                  ? <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Belum ada dokumen yang diunggah untuk lahan ini.</p>
                  : viewDoc.documents.map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < viewDoc.documents.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{d.document_type || d.document_name || `Dokumen #${i + 1}`}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{d.description || d.file_name || "—"}</div>
                      </div>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: d.status === "verified" || d.status === "approved" ? "#dcfce7" : "#fef3c7", color: d.status === "verified" || d.status === "approved" ? "#15803d" : "#b45309", fontWeight: 700, alignSelf: "flex-start", whiteSpace: "nowrap" }}>
                        {d.status || "Pending"}
                      </span>
                    </div>
                  ))
                }
              </Section>

              <Section title={`Siklus Tanam (${viewDoc.cycles.length} siklus)`} icon={<IcoLeaf />}>
                {viewDoc.cycles.length === 0
                  ? <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>Belum ada siklus tanam tercatat untuk lahan ini.</p>
                  : viewDoc.cycles.map((c, i) => (
                    <div key={i} style={{ padding: "8px 0", borderBottom: i < viewDoc.cycles.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Siklus Tanam {i + 1}</div>
                          <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                            Mulai: <strong>{c.start_date || "—"}</strong> · Target: <strong>{c.expected_harvest_date || "—"}</strong>
                          </div>
                          {c.notes && <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{c.notes}</div>}
                        </div>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: ["panen","selesai"].includes(c.status || "") ? "#dcfce7" : "#fef3c7", color: ["panen","selesai"].includes(c.status || "") ? "#15803d" : "#b45309", fontWeight: 700, whiteSpace: "nowrap" }}>
                          {c.status || "bibit"}
                        </span>
                      </div>
                      {c.cycle_activities && c.cycle_activities.length > 0 && (
                        <div style={{ marginTop: 4, fontSize: 11, color: "#94a3b8" }}>{c.cycle_activities.length} aktivitas tercatat</div>
                      )}
                    </div>
                  ))
                }
              </Section>

              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px", fontSize: 11, color: "#64748b", lineHeight: 1.7, border: "1px solid #e2e8f0" }}>
                Dokumen ini dibuat secara otomatis oleh sistem Agrantara sebagai bukti penelusuran rantai pasokan sesuai persyaratan Regulasi EUDR (EU) 2023/1115.
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 24px", borderTop: "1px solid #f1f5f9", display: "flex", gap: 10 }}>
              <button onClick={() => printTrace(viewDoc)}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", border: "2px solid #e2e8f0", background: "#fff", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#374151", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#f0fdf4"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#10b981"; (e.currentTarget as HTMLButtonElement).style.color = "#047857"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.color = "#374151"; }}>
                <IcoPrint /> Cetak / Export PDF
              </button>
              <button onClick={() => setViewDoc(null)}
                style={{ padding: "11px 18px", border: "1.5px solid #e2e8f0", background: "#f8fafc", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#64748b" }}>
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────
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
