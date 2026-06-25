"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SUBJECTS = [
  "Laporkan Bug / Error",
  "Permintaan Fitur Baru",
  "Masalah Login / Akses Akun",
  "Pertanyaan tentang EUDR",
  "Konsultasi Penggunaan Aplikasi",
  "Lainnya",
];

export default function ContactPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [user, setUser] = useState<{ full_name?: string; email?: string } | null>(null);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject) { toast.error("Pilih kategori masalah terlebih dahulu."); return; }
    if (form.message.trim().length < 20) { toast.error("Pesan minimal 20 karakter."); return; }

    setSending(true);
    const name = user?.full_name || "Pengguna";
    const email = user?.email || "";
    const mailBody = encodeURIComponent(
      `Nama: ${name}\nEmail: ${email}\nKategori: ${form.subject}\n\nPesan:\n${form.message}`
    );
    const mailSubject = encodeURIComponent(`[Agrantara] ${form.subject}`);
    window.location.href = `mailto:admin@agrantara.id?subject=${mailSubject}&body=${mailBody}`;

    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast.success("Pesan berhasil disiapkan! Selesaikan pengiriman di aplikasi email Anda.");
    }, 800);
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#064e3b 0%,#047857 60%,#10b981 100%)", borderRadius: 14, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>Hubungi Admin</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#a7f3d0" }}>Kirim masukan, laporan bug, atau pertanyaan kepada tim pengelola Agrantara</p>
          </div>
        </div>
      </div>

      {sent ? (
        /* Success State */
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "48px 32px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="#16a34a" strokeWidth="2.5" width="28" height="28" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8"/></svg>
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Pesan Disiapkan!</h3>
          <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Aplikasi email Anda akan terbuka untuk mengirim pesan. Tim Agrantara biasanya merespons dalam 1–2 hari kerja.
          </p>
          <button onClick={() => setSent(false)}
            style={{ padding: "10px 24px", background: "#10b981", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Kirim Pesan Lain
          </button>
        </div>
      ) : (
        <div className="agr-contact-layout">
          {/* Form */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "24px 28px" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>Formulir Kontak</h3>
            <form ref={formRef} onSubmit={handleSend}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Nama</label>
                  <input readOnly value={user?.full_name || ""} style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#f8fafc", color: "#64748b", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email</label>
                  <input readOnly value={user?.email || "—"} style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#f8fafc", color: "#64748b", boxSizing: "border-box" }} />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Kategori Masalah <span style={{ color: "#dc2626" }}>*</span></label>
                <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  style={{ width: "100%", height: 40, padding: "0 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff", color: form.subject ? "#0f172a" : "#94a3b8", boxSizing: "border-box", outline: "none" }}>
                  <option value="">-- Pilih kategori --</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Pesan <span style={{ color: "#dc2626" }}>*</span>
                  <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 8 }}>({form.message.length}/1000)</span>
                </label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value.slice(0, 1000) }))}
                  placeholder="Tuliskan pesan, pertanyaan, atau laporan Anda secara detail... (Minimal 20 Karakter)"
                  rows={7}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }} />
              </div>

              <button type="submit" disabled={sending}
                style={{ width: "100%", padding: "11px", background: sending ? "#6b7280" : "#10b981", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {sending ? (
                  <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Memproses...</>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 10L18 2l-6 16-3-7-7-1z"/>
                    </svg>
                    Kirim Pesan
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Panel */}
          <div className="agr-contact-info" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: "📧", title: "Email", val: "admin@agrantara.id" },
              { icon: "⏱️", title: "Respons", val: "1–2 hari kerja" },
              { icon: "🌐", title: "Jam Operasional", val: "Senin–Jumat\n08.00–17.00 WIB" },
            ].map((info, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{info.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>{info.title}</span>
                </div>
                <div style={{ fontSize: 12, color: "#64748b", whiteSpace: "pre-line" }}>{info.val}</div>
              </div>
            ))}
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#15803d", marginBottom: 6 }}>Tips</div>
              <div style={{ fontSize: 11, color: "#166534", lineHeight: 1.6 }}>Sertakan ID lahan atau screenshot error agar tim kami dapat membantu lebih cepat.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
