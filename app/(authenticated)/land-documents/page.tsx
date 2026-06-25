"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────
interface LandDoc {
  id: number | string;
  land_id: number | string;
  land_name?: string;
  document_type: string;
  file_name?: string;
  file_url?: string;
  description?: string;
  status?: string;
  created_at?: string;
}

interface Land {
  id: number | string;
  land_name: string;
}

const DOC_TYPES = [
  "Sertifikat Kepemilikan Lahan",
  "Pernyataan Non-Deforestasi EUDR",
  "Sertifikat RSPO",
  "Sertifikat ISPO",
  "Surat Izin Usaha Perkebunan",
  "Dokumen Legalitas Lainnya",
];

// ─── LocalStorage helpers ─────────────────────────────────────────
const LS_DOCS = "local_land_documents";
function loadLocalDocs(): LandDoc[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_DOCS) || "[]"); } catch { return []; }
}
function saveLocalDocs(docs: LandDoc[]) {
  localStorage.setItem(LS_DOCS, JSON.stringify(docs));
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Chrome 92+ blocks data: URLs in new tabs — convert to blob URL first
function openFileUrl(url: string) {
  if (!url) return;
  if (url.startsWith("data:")) {
    try {
      const [meta, b64] = url.split(",");
      const mime = meta.split(":")[1].split(";")[0];
      const bytes = atob(b64);
      const buf = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
      const blob = new Blob([buf], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      // Fallback: anchor download
      const a = document.createElement("a");
      a.href = url;
      a.download = "dokumen";
      a.click();
    }
  } else {
    window.open(url, "_blank");
  }
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
export default function LandDocumentsPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<LandDoc[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLand, setFilterLand] = useState("");
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ land_id: "", document_type: "", description: "" });
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<LandDoc | null>(null);
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
      const [landRes, docRes] = await Promise.all([
        fetch("/api/proxy/land/index", { headers: auth }).then(r => r.json()).catch(() => null),
        fetch("/api/proxy/land-document", { headers: auth }).then(r => r.json()).catch(() => null),
      ]);

      if (landRes) {
        setLands(Array.isArray(landRes) ? landRes : (Array.isArray(landRes.data) ? landRes.data : []));
      }

      const localDocs = loadLocalDocs();
      if (docRes && (Array.isArray(docRes) || docRes?.data)) {
        const apiDocs: LandDoc[] = Array.isArray(docRes) ? docRes : (docRes.data || []);
        const apiIds = new Set(apiDocs.map(d => String(d.id)));
        const localOnly = localDocs.filter(d => !apiIds.has(String(d.id)));
        setDocs([...apiDocs, ...localOnly]);
      } else {
        setDocs(localDocs);
      }
    } catch {
      setDocs(loadLocalDocs());
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!form.land_id) { setFormError("Pilih lahan terlebih dahulu."); return; }
    if (!form.document_type) { setFormError("Pilih jenis dokumen."); return; }
    if (!formFile) { setFormError("Pilih file dokumen yang akan diunggah."); return; }

    setSaving(true); setFormError("");
    const t = localStorage.getItem("access_token") || "";

    let apiSuccess = false;
    try {
      const body = new FormData();
      body.append("land_id", form.land_id);
      body.append("document_type", form.document_type);
      body.append("description", form.description);
      body.append("file", formFile);
      const res = await fetch("/api/proxy/land-document/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success !== false) apiSuccess = true;
    } catch {}

    if (!apiSuccess) {
      try {
        const land = lands.find(l => String(l.id) === form.land_id);
        let fileUrl: string | undefined;
        if (formFile.size <= 3 * 1024 * 1024) {
          try { fileUrl = await readFileAsDataURL(formFile); } catch { /* ignore, save without preview */ }
        }
        const newDoc: LandDoc = {
          id: `local_${Date.now()}`,
          land_id: form.land_id,
          land_name: land?.land_name,
          document_type: form.document_type,
          file_name: formFile.name,
          file_url: fileUrl,
          description: form.description || undefined,
          status: "pending",
          created_at: new Date().toISOString(),
        };
        const localDocs = loadLocalDocs();
        try {
          saveLocalDocs([...localDocs, newDoc]);
        } catch {
          // QuotaExceededError — strip file_url from older docs to free space, keep new doc's preview
          const stripped = localDocs.map(d => ({ ...d, file_url: undefined }));
          try {
            saveLocalDocs([...stripped, newDoc]);
          } catch {
            newDoc.file_url = undefined;
            saveLocalDocs([...stripped, newDoc]);
          }
        }
        toast.success("Dokumen berhasil disimpan secara lokal.");
      } catch {
        setFormError("Gagal menyimpan dokumen.");
        setSaving(false);
        return;
      }
    }

    setShowModal(false);
    setForm({ land_id: "", document_type: "", description: "" });
    setFormFile(null);
    setSaving(false);
    fetchAll();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const t = localStorage.getItem("access_token") || "";
    const isLocal = String(deleteTarget.id).startsWith("local_");

    if (!isLocal) {
      try {
        await fetch(`/api/proxy/land-document/delete/${deleteTarget.id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${t}` },
        });
      } catch {}
    }

    const updated = loadLocalDocs().filter(d => String(d.id) !== String(deleteTarget.id));
    saveLocalDocs(updated);
    setDeleteTarget(null);
    setDeleting(false);
    fetchAll();
  }

  const filtered = useMemo(() => docs.filter(d => {
    const landMatch = filterLand ? String(d.land_id) === filterLand : true;
    const searchMatch = search
      ? (d.land_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (d.document_type || "").toLowerCase().includes(search.toLowerCase())
      : true;
    return landMatch && searchMatch;
  }), [docs, filterLand, search]);

  const statusBadge = (status?: string) => {
    const s = status?.toLowerCase() || "pending";
    const map: Record<string, { bg: string; color: string; border: string }> = {
      verified: { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
      approved: { bg: "#dcfce7", color: "#16a34a", border: "#bbf7d0" },
      pending:  { bg: "#fef3c7", color: "#d97706", border: "#fde68a" },
      rejected: { bg: "#fee2e2", color: "#dc2626", border: "#fecaca" },
    };
    const st = map[s] || map.pending;
    return (
      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
        {(status || "Pending").charAt(0).toUpperCase() + (status || "Pending").slice(1)}
      </span>
    );
  };

  const landOptions = lands.map(l => ({ value: String(l.id), label: l.land_name }));
  const landFilterOptions = [{ value: "", label: "Semua Lahan" }, ...landOptions];
  const docTypeOptions = DOC_TYPES.map(t => ({ value: t, label: t }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#064e3b,#047857)", borderRadius: 14, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3h6l2 3h5v11H3V4a1 1 0 011-1z"/></svg>
              </div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>Land Documents</h2>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: "#a7f3d0" }}>Kelola dokumen legalitas lahan untuk kepatuhan EUDR dan sertifikasi ekspor</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setFormError(""); setForm({ land_id: "", document_type: "", description: "" }); setFormFile(null); }}
            style={{ padding: "10px 18px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 2px 8px rgba(16,185,129,0.3)" }}
          >
            + Upload Dokumen
          </button>
        </div>
      </div>

      {/* Stat cards */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
          {[
            { label: "Total Dokumen", value: docs.length, color: "#2563eb", bg: "#eff6ff" },
            { label: "Terverifikasi", value: docs.filter(d => ["verified", "approved"].includes(d.status?.toLowerCase() || "")).length, color: "#16a34a", bg: "#f0fdf4" },
            { label: "Pending Review", value: docs.filter(d => !d.status || d.status.toLowerCase() === "pending").length, color: "#d97706", bg: "#fef3c7" },
            { label: "Total Lahan", value: lands.length, color: "#7c3aed", bg: "#f5f3ff" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px", transition: "box-shadow 0.15s" }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: s.bg, width: "40%" }} />
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ background: "#fff", padding: "14px 16px", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text" placeholder="Cari dokumen atau lahan..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180, padding: "9px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 13, outline: "none", transition: "border-color 0.2s" }}
          onFocus={e => e.target.style.borderColor = "#10b981"}
          onBlur={e => e.target.style.borderColor = "#e2e8f0"}
        />
        <div style={{ minWidth: 180 }}>
          <CustomSelect value={filterLand} onChange={setFilterLand} options={landFilterOptions} placeholder="Semua Lahan" />
        </div>
        <span style={{ fontSize: 13, color: "#64748b" }}>{filtered.length} dokumen</span>
      </div>

      {loading && <div style={{ textAlign: "center", padding: "48px 0", color: "#64748b" }}>Memuat dokumen...</div>}

      {/* Table */}
      {!loading && (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 650 }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#064e3b,#047857)", color: "#a7f3d0" }}>
                {["#", "Lahan", "Jenis Dokumen", "Deskripsi", "Status", "Tanggal Upload", "Aksi"].map(h => (
                  <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, textTransform: "uppercase", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ padding: "48px 14px", textAlign: "center", color: "#94a3b8" }}>
                  {docs.length === 0
                    ? "Belum ada dokumen. Klik Upload Dokumen untuk menambahkan."
                    : "Tidak ada dokumen yang cocok."}
                </td></tr>
              )}
              {filtered.map((doc, i) => {
                const isLocal = String(doc.id).startsWith("local_");
                return (
                  <tr key={doc.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "12px 14px", color: "#94a3b8" }}>{i + 1}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#0f172a" }}>
                      {doc.land_name || lands.find(l => String(l.id) === String(doc.land_id))?.land_name || `Lahan #${doc.land_id}`}
                      {isLocal && <span style={{ marginLeft: 6, fontSize: 10, padding: "1px 5px", borderRadius: 4, background: "#fef3c7", color: "#b45309" }}>Lokal</span>}
                    </td>
                    <td style={{ padding: "12px 14px", color: "#374151" }}>{doc.document_type}</td>
                    <td style={{ padding: "12px 14px", color: "#64748b", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {doc.description || "-"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>{statusBadge(doc.status)}</td>
                    <td style={{ padding: "12px 14px", color: "#64748b", whiteSpace: "nowrap" }}>
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString("id-ID") : "-"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {doc.file_url && (
                          <button
                            onClick={() => openFileUrl(doc.file_url!)}
                            style={{ padding: "5px 10px", border: "1px solid #bfdbfe", background: "#eff6ff", borderRadius: 6, fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 500, cursor: "pointer" }}>
                            Lihat
                          </button>
                        )}
                        <button onClick={() => setDeleteTarget(doc)}
                          style={{ padding: "5px 10px", border: "1px solid #fee2e2", background: "#fff", borderRadius: 6, fontSize: 12, color: "#dc2626", cursor: "pointer" }}>
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

      {/* Upload Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 520, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #f1f5f9", paddingBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Upload Dokumen Lahan</h3>
                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#94a3b8" }}>PDF, JPG, atau PNG — maks. 10MB</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "#f8fafc", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#64748b", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            {formError && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span>⚠</span> {formError}
              </div>
            )}

            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                  Pilih Lahan <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <CustomSelect
                  value={form.land_id}
                  onChange={v => setForm(f => ({ ...f, land_id: v }))}
                  options={landOptions}
                  placeholder="-- Pilih Lahan --"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                  Jenis Dokumen <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <CustomSelect
                  value={form.document_type}
                  onChange={v => setForm(f => ({ ...f, document_type: v }))}
                  options={docTypeOptions}
                  placeholder="-- Pilih Jenis Dokumen --"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Deskripsi</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Catatan singkat tentang dokumen ini..."
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "2px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#10b981"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
                  File Dokumen <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => {
                    e.preventDefault(); setDragOver(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) setFormFile(f);
                  }}
                  style={{
                    border: `2px dashed ${dragOver ? "#10b981" : formFile ? "#10b981" : "#d1d5db"}`,
                    borderRadius: 12,
                    padding: "24px 20px",
                    textAlign: "center",
                    background: dragOver ? "#f0fdf4" : formFile ? "#f0fdf4" : "#fafbfc",
                    transition: "all 0.2s",
                    position: "relative",
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setFormFile(e.target.files?.[0] || null)}
                    style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                  />
                  {formFile ? (
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#047857" }}>{formFile.name}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                        {(formFile.size / 1024 / 1024).toFixed(2)} MB — Klik untuk ganti file
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>📁</div>
                      <p style={{ margin: 0, fontSize: 14, color: "#64748b" }}>
                        <strong style={{ color: "#047857" }}>Klik untuk pilih file</strong> atau drag & drop di sini
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>PDF, JPG, PNG — maks. 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: "10px 20px", border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#374151" }}>
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: "10px 20px", background: saving ? "#6b7280" : "linear-gradient(135deg,#047857,#10b981)", color: "#fff", border: "none", borderRadius: 10, cursor: saving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600, boxShadow: saving ? "none" : "0 2px 8px rgba(16,185,129,0.3)" }}>
                  {saving ? "Mengunggah..." : "Upload Dokumen"}
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
              <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}>Hapus Dokumen?</h3>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
                Dokumen <strong>&ldquo;{deleteTarget.document_type}&rdquo;</strong> akan dihapus secara permanen.
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
