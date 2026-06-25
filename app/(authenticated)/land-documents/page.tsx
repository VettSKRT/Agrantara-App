"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
        fetch("/api/proxy/land/index", { headers: auth }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch("/api/proxy/land-document", { headers: auth }).then(r => r.json()).catch(() => ({ data: [] })),
      ]);

      const landList = Array.isArray(landRes) ? landRes : (Array.isArray(landRes.data) ? landRes.data : []);
      setLands(landList);

      const docList = Array.isArray(docRes) ? docRes : (Array.isArray(docRes.data) ? docRes.data : []);
      setDocs(docList);
    } catch (e) {
      console.error(e);
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

      if (!res.ok || data.success === false) {
        setFormError(data.message || data.msg || `HTTP ${res.status}`);
        return;
      }
      setShowModal(false);
      setForm({ land_id: "", document_type: "", description: "" });
      setFormFile(null);
      fetchAll();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Gagal upload dokumen.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const t = localStorage.getItem("access_token") || "";
    try {
      const res = await fetch(`/api/proxy/land-document/delete/${deleteTarget.id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setDeleteTarget(null);
      fetchAll();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus dokumen.");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    return docs.filter(d => {
      const landMatch = filterLand ? String(d.land_id) === filterLand : true;
      const searchMatch = search
        ? (d.land_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (d.document_type || "").toLowerCase().includes(search.toLowerCase())
        : true;
      return landMatch && searchMatch;
    });
  }, [docs, filterLand, search]);

  const statusBadge = (status?: string) => {
    const s = status?.toLowerCase() || "pending";
    const map: Record<string, { bg: string; color: string }> = {
      verified: { bg: "#dcfce7", color: "#16a34a" },
      approved: { bg: "#dcfce7", color: "#16a34a" },
      pending:  { bg: "#fef3c7", color: "#d97706" },
      rejected: { bg: "#fee2e2", color: "#dc2626" },
    };
    const st = map[s] || map.pending;
    return (
      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, background: st.bg, color: st.color }}>
        {(status || "Pending").charAt(0).toUpperCase() + (status || "Pending").slice(1)}
      </span>
    );
  };

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
            onClick={() => { setShowModal(true); setFormError(""); }}
            style={{ padding: "10px 18px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            Upload Dokumen
          </button>
        </div>
      </div>

      {/* Stat cards */}
      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
          {[
            { label: "Total Dokumen", value: docs.length, icon: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h7l3 3v11H4V2z"/><path d="M11 2v3h3M6 8h6M6 11h6M6 14h3"/></svg>, color: "#2563eb" },
            { label: "Terverifikasi", value: docs.filter(d => ["verified","approved"].includes(d.status?.toLowerCase() || "")).length, icon: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="7.5"/><path d="M5.5 9l2.5 2.5 5-5"/></svg>, color: "#16a34a" },
            { label: "Pending Review", value: docs.filter(d => !d.status || d.status.toLowerCase() === "pending").length, icon: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" strokeLinecap="round"><circle cx="9" cy="9" r="7.5"/><path d="M9 5v4.5l3 1.5"/></svg>, color: "#d97706" },
            { label: "Total Lahan", value: lands.length, icon: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" width="18" height="18" strokeLinecap="round" strokeLinejoin="round"><path d="M2 16l3.5-7 2.5 3.5 3-5 4.5 8.5H2z"/></svg>, color: "#7c3aed" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ background: "#fff", padding: "14px 16px", borderRadius: 12, border: "1px solid #e2e8f0", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="text" placeholder="Cari dokumen atau lahan..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 180, padding: "9px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }}
        />
        <select
          value={filterLand} onChange={e => setFilterLand(e.target.value)}
          style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, background: "#fff", outline: "none" }}
        >
          <option value="">Semua Lahan</option>
          {lands.map(l => <option key={l.id} value={String(l.id)}>{l.land_name}</option>)}
        </select>
        <span style={{ fontSize: 13, color: "#64748b" }}>{filtered.length} dokumen</span>
      </div>

      {/* Loading */}
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
              {filtered.map((doc, i) => (
                <tr key={doc.id} style={{ borderBottom: "1px solid #f1f5f9" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "12px 14px", color: "#94a3b8" }}>{i + 1}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: "#0f172a" }}>
                    {doc.land_name || lands.find(l => String(l.id) === String(doc.land_id))?.land_name || `Lahan #${doc.land_id}`}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#374151" }}>
                      {doc.document_type}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", color: "#64748b", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {doc.description || "-"}
                  </td>
                  <td style={{ padding: "12px 14px" }}>{statusBadge(doc.status)}</td>
                  <td style={{ padding: "12px 14px", color: "#64748b", whiteSpace: "nowrap" }}>
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString("id-ID") : "-"}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {doc.file_url && (
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                          style={{ padding: "5px 10px", border: "1px solid #bfdbfe", background: "#eff6ff", borderRadius: 6, fontSize: 12, color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
                          Lihat
                        </a>
                      )}
                      <button onClick={() => setDeleteTarget(doc)}
                        style={{ padding: "5px 10px", border: "1px solid #fee2e2", background: "#fff", borderRadius: 6, fontSize: 12, color: "#dc2626", cursor: "pointer" }}>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, maxWidth: 500, width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, borderBottom: "1px solid #f1f5f9", paddingBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Upload Dokumen Lahan</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>×</button>
            </div>

            {formError && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 13, marginBottom: 16 }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleUpload} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Pilih Lahan <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select value={form.land_id} onChange={e => setForm(f => ({ ...f, land_id: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, background: "#fff", outline: "none" }}>
                  <option value="">-- Pilih Lahan --</option>
                  {lands.map(l => <option key={l.id} value={String(l.id)}>{l.land_name}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Jenis Dokumen <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select value={form.document_type} onChange={e => setForm(f => ({ ...f, document_type: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, background: "#fff", outline: "none" }}>
                  <option value="">-- Pilih Jenis Dokumen --</option>
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Deskripsi</label>
                <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Catatan singkat tentang dokumen ini..."
                  style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  File Dokumen <span style={{ color: "#dc2626" }}>*</span>
                  <span style={{ fontWeight: 400, color: "#64748b", marginLeft: 6 }}>(PDF, JPG, PNG — maks. 10MB)</span>
                </label>
                <div style={{ border: "2px dashed #e2e8f0", borderRadius: 8, padding: "20px", textAlign: "center", background: "#fafbfc" }}>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setFormFile(e.target.files?.[0] || null)}
                    style={{ display: "block", width: "100%", fontSize: 13 }}
                  />
                  {formFile && (
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: "#16a34a" }}>
                      {formFile.name} ({(formFile.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)}
                  style={{ padding: "9px 18px", border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500 }}>
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: "9px 18px", background: saving ? "#6b7280" : "#10b981", color: "#fff", border: "none", borderRadius: 8, cursor: saving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 600 }}>
                  {saving ? "Mengunggah..." : "Upload"}
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
              <h3 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700 }}>Hapus Dokumen?</h3>
              <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
                Dokumen <strong>"{deleteTarget.document_type}"</strong> akan dihapus secara permanen.
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
