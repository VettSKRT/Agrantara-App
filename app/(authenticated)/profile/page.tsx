"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Icons ────────────────────────────────────────────────────────
const IcoUser    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4.5"/><path d="M3 21c0-5 4-9 9-9s9 4 9 9"/></svg>;
const IcoEdit    = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2.5a2 2 0 012.8 2.8L5.5 15.5 2 17l1.5-3.5L13 2.5z"/></svg>;
const IcoKey     = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="10" r="4.5"/><path d="M11.5 10H18M16 8v4"/></svg>;
const IcoSave    = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h11l3 3v11H3V3zM7 3v5h7V3M6 17v-6h8v6"/></svg>;
const IcoClose   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round"><path d="M4 4l12 12M16 4L4 16"/></svg>;
const IcoCheck   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8"/></svg>;
const IcoPhone   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h4l1.5 4-2.5 1.5A10.7 10.7 0 0013 13l1.5-2.5L18 12v4c-7.7 2-16-6.3-14-14z"/></svg>;
const IcoMail    = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="16" height="13" rx="2"/><path d="M2 7l8 5 8-5"/></svg>;
const IcoId      = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="16" height="11" rx="2"/><circle cx="7" cy="10" r="2"/><path d="M11 8h5M11 12h5"/></svg>;

interface UserProfile {
  id?: number | string;
  full_name?: string;
  username?: string;
  email?: string;
  nik?: string;
  phone?: string;
  role?: string;
}

interface PwdForm { current: string; next: string; confirm: string; }
type PwdErrors = Partial<Record<keyof PwdForm, string>>;

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState(false);

  // Edit modal state
  const [showEdit, setShowEdit]     = useState(false);
  const [editForm, setEditForm]     = useState<UserProfile>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError]   = useState("");
  const [editOk, setEditOk]         = useState(false);

  // Password modal state
  const [showPwd, setShowPwd]     = useState(false);
  const [pwd, setPwd]             = useState<PwdForm>({ current: "", next: "", confirm: "" });
  const [pwdErrors, setPwdErrors] = useState<PwdErrors>({});
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdOk, setPwdOk]         = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/login"); return; }
    try {
      const raw = localStorage.getItem("user");
      if (raw) { const u = JSON.parse(raw); setProfile(u); }
    } catch {}
  }, []);

  const initials = (profile.full_name || profile.username || "?")
    .split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  // ── Edit Profile ──────────────────────────────────────────────
  function openEdit() {
    setEditForm({ ...profile });
    setEditError(""); setEditOk(false);
    setShowEdit(true);
  }

  async function saveEdit() {
    if (!editForm.full_name?.trim()) { setEditError("Nama lengkap wajib diisi."); return; }
    setEditSaving(true); setEditError("");
    const token = localStorage.getItem("access_token") || "";
    const tt    = "Bearer";
    try {
      const res = await fetch(`/api/proxy/user/update`, {
        method: "POST",
        headers: { Authorization: `${tt} ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: editForm.full_name,
          email: editForm.email,
          phone: editForm.phone,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || `HTTP ${res.status}`);
      }
      const updated = { ...profile, ...editForm };
      setProfile(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setEditOk(true);
      setTimeout(() => { setShowEdit(false); setEditOk(false); }, 1200);
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : "Gagal menyimpan perubahan.");
    } finally {
      setEditSaving(false);
    }
  }

  // ── Change Password ───────────────────────────────────────────
  function validatePwd(): PwdErrors {
    const errs: PwdErrors = {};
    if (!pwd.current) errs.current = "Kata sandi saat ini wajib diisi.";
    if (pwd.next.length < 8) errs.next = "Kata sandi baru minimal 8 karakter.";
    if (pwd.next !== pwd.confirm) errs.confirm = "Konfirmasi kata sandi tidak cocok.";
    return errs;
  }

  async function savePwd() {
    const errs = validatePwd();
    setPwdErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setPwdSaving(true);
    const token = localStorage.getItem("access_token") || "";
    const tt    = "Bearer";
    try {
      const res = await fetch("/api/proxy/user/change-password", {
        method: "POST",
        headers: { Authorization: `${tt} ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: pwd.current, new_password: pwd.next }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || `HTTP ${res.status}`);
      }
      setPwdOk(true);
      setPwd({ current: "", next: "", confirm: "" });
      setTimeout(() => { setShowPwd(false); setPwdOk(false); }, 1500);
    } catch (e: unknown) {
      setPwdErrors({ current: e instanceof Error ? e.message : "Gagal mengganti kata sandi." });
    } finally {
      setPwdSaving(false);
    }
  }

  const fieldStyle = { width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" as const };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 };
  const errStyle   = { fontSize: 11, color: "#b91c1c", marginTop: 4 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 760 }}>

      {/* ── Hero ── */}
      <div style={{ background: "linear-gradient(135deg,#064e3b 0%,#047857 60%,#10b981 100%)", borderRadius: 14, padding: "24px 28px", display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#fff" }}>{profile.full_name || profile.username || "Profil Saya"}</h2>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#a7f3d0" }}>@{profile.username || "—"} · {profile.role || "Petani"}</p>
        </div>
      </div>

      {/* ── Info Card ── */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Data Profil</h3>
          <button onClick={openEdit}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "1px solid #a7f3d0", background: "#f0fdf4", color: "#047857", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <IcoEdit /> Ubah Data
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}>
          {[
            { icon: <IcoUser />,  label: "Nama Lengkap",  value: profile.full_name  || "—" },
            { icon: <IcoUser />,  label: "Username",      value: profile.username   || "—" },
            { icon: <IcoMail />,  label: "Email",         value: profile.email      || "—" },
            { icon: <IcoId />,    label: "NIK",           value: profile.nik        || "—" },
            { icon: <IcoPhone />, label: "Nomor HP",      value: profile.phone      || "—" },
            { icon: <IcoUser />,  label: "Role",          value: profile.role       || "Petani" },
          ].map((f, i) => (
            <div key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ color: "#047857" }}>{f.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", paddingLeft: 22 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Change Password Card ── */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>Keamanan Akun</h3>
            <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Ubah kata sandi secara berkala untuk keamanan akun Anda.</p>
          </div>
          <button onClick={() => { setPwd({ current: "", next: "", confirm: "" }); setPwdErrors({}); setPwdOk(false); setShowPwd(true); }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "1px solid #dbeafe", background: "#eff6ff", color: "#1d4ed8", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
            <IcoKey /> Ubah Password
          </button>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {showEdit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, maxWidth: 480, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Ubah Data Profil</h3>
              <button onClick={() => setShowEdit(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><IcoClose /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Nama Lengkap *</label>
                <input value={editForm.full_name || ""} onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))} style={fieldStyle} placeholder="Nama lengkap" />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input value={editForm.email || ""} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} style={fieldStyle} placeholder="email@contoh.com" type="email" />
              </div>
              <div>
                <label style={labelStyle}>Nomor HP</label>
                <input value={editForm.phone || ""} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} style={fieldStyle} placeholder="08xxxxxxxxxx" />
              </div>
            </div>

            {editError && <div style={{ marginTop: 10, padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, fontSize: 12, color: "#b91c1c" }}>{editError}</div>}
            {editOk    && <div style={{ marginTop: 10, padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 12, color: "#15803d", display: "flex", alignItems: "center", gap: 6 }}><IcoCheck /> Data berhasil disimpan!</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowEdit(false)} disabled={editSaving}
                style={{ flex: 1, padding: 10, border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 14, color: "#374151" }}>
                Batal
              </button>
              <button onClick={saveEdit} disabled={editSaving}
                style={{ flex: 1, padding: 10, background: "linear-gradient(135deg,#064e3b,#10b981)", color: "#fff", border: "none", borderRadius: 8, cursor: editSaving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                <IcoSave /> {editSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Change Password Modal ── */}
      {showPwd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 28, maxWidth: 440, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Ubah Kata Sandi</h3>
              <button onClick={() => setShowPwd(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><IcoClose /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(["current", "next", "confirm"] as const).map(k => {
                const labels = { current: "Kata Sandi Saat Ini", next: "Kata Sandi Baru", confirm: "Konfirmasi Kata Sandi Baru" };
                return (
                  <div key={k}>
                    <label style={labelStyle}>{labels[k]}</label>
                    <input type="password" value={pwd[k]} onChange={e => setPwd(p => ({ ...p, [k]: e.target.value }))}
                      style={{ ...fieldStyle, borderColor: pwdErrors[k] ? "#fca5a5" : "#e2e8f0" }} placeholder="••••••••" />
                    {pwdErrors[k] && <div style={errStyle}>{pwdErrors[k]}</div>}
                  </div>
                );
              })}
            </div>

            {pwdOk && <div style={{ marginTop: 10, padding: "8px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 12, color: "#15803d", display: "flex", alignItems: "center", gap: 6 }}><IcoCheck /> Kata sandi berhasil diubah!</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowPwd(false)} disabled={pwdSaving}
                style={{ flex: 1, padding: 10, border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 14, color: "#374151" }}>
                Batal
              </button>
              <button onClick={savePwd} disabled={pwdSaving}
                style={{ flex: 1, padding: 10, background: "linear-gradient(135deg,#1e40af,#2563eb)", color: "#fff", border: "none", borderRadius: 8, cursor: pwdSaving ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                <IcoKey /> {pwdSaving ? "Menyimpan..." : "Ubah Kata Sandi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
