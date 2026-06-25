"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function genPassword(email: string): string {
  const base = btoa(encodeURIComponent(email + "agrantara-g-2026"))
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 20);
  return "G_" + base;
}

function getStoredCreds(email: string): { username: string; password: string } | null {
  try {
    const raw = localStorage.getItem(`google_creds_${email}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

type Stage = "loading" | "complete" | "logging_in" | "done";

interface GUser { name: string; email: string; picture?: string }
interface FormState { username: string; nik: string; phone: string; address: string }
interface FormErrors { username?: string; nik?: string; phone?: string }

function validateForm(f: FormState): FormErrors {
  const e: FormErrors = {};
  if (!f.username.trim()) e.username = "Username wajib diisi.";
  else if (f.username.trim().length < 3) e.username = "Username minimal 3 karakter.";
  else if (!/^[a-zA-Z0-9_]+$/.test(f.username.trim())) e.username = "Hanya huruf, angka, dan underscore.";
  if (!f.nik.trim()) e.nik = "NIK wajib diisi.";
  else if (!/^[0-9]{16}$/.test(f.nik.trim())) e.nik = "NIK harus 16 digit angka.";
  if (f.phone && !/^(\+62|62|0)[0-9]{8,12}$/.test(f.phone.replace(/\s/g, "")))
    e.phone = "Format tidak valid (contoh: 08123456789).";
  return e;
}

export default function GoogleAuthPage() {
  const router = useRouter();
  const [gUser, setGUser] = useState<GUser | null>(null);
  const [stage, setStage] = useState<Stage>("loading");
  const [form, setForm] = useState<FormState>({ username: "", nik: "", phone: "", address: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [statusMsg, setStatusMsg] = useState("Memverifikasi akun Google...");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("google_pending_user");
      if (!raw) { router.push("/login"); return; }
      const user: GUser = JSON.parse(raw);
      setGUser(user);

      // Already have a valid token — skip everything
      if (localStorage.getItem("access_token")) {
        localStorage.removeItem("google_pending_user");
        router.push("/dashboard");
        return;
      }

      const creds = getStoredCreds(user.email);
      if (creds) {
        setStage("logging_in");
        setStatusMsg("Masuk ke akun Anda...");
        doLogin(creds.username, creds.password, user);
      } else {
        const suggested = user.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 20) || "petani";
        setForm(f => ({ ...f, username: suggested }));
        setStage("complete");
      }
    } catch {
      router.push("/login");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doLogin(username: string, password: string, user: GUser) {
    try {
      const body = new URLSearchParams();
      body.append("username", username);
      body.append("password", password);
      const res = await fetch("/api/proxy/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "omit",
        body: body.toString(),
      });
      const data = await res.json();
      if (data.success && data.data?.access_token) {
        localStorage.setItem("access_token", data.data.access_token);
        localStorage.setItem("token_type", data.data.token_type || "Bearer");
        localStorage.setItem("expired_at", data.data.expired_at || "");
        localStorage.setItem("user", JSON.stringify(data.data.user));
        localStorage.removeItem("google_pending_user");
        setStage("done");
        router.push("/dashboard");
      } else {
        // Credentials stale — clear and show completion form
        localStorage.removeItem(`google_creds_${user.email}`);
        setForm(f => ({
          ...f,
          username: user.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 20) || "petani",
        }));
        setErrorMsg("Sesi sebelumnya kedaluwarsa. Lengkapi data Anda untuk masuk kembali.");
        setStage("complete");
      }
    } catch {
      setErrorMsg("Tidak dapat terhubung ke server. Silakan coba lagi.");
      setStage("complete");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ username: true, nik: true, phone: true });
    const errs = validateForm(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !gUser) return;

    setSubmitting(true);
    setErrorMsg("");

    const password = genPassword(gUser.email);

    try {
      // Register
      const regBody = new URLSearchParams();
      regBody.append("full_name", gUser.name);
      regBody.append("username", form.username.trim());
      regBody.append("email", gUser.email);
      regBody.append("password", password);
      regBody.append("nik", form.nik.trim());
      if (form.phone.trim()) regBody.append("phone", form.phone.trim());
      if (form.address.trim()) regBody.append("address", form.address.trim());

      const regRes = await fetch("/api/proxy/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: regBody.toString(),
      });
      const regData = await regRes.json().catch(() => ({}));

      if (!regRes.ok || regData.success === false) {
        let msg = "";
        if (Array.isArray(regData.errors) && regData.errors.length > 0) msg = regData.errors.join(" • ");
        else msg = regData.message || regData.msg || `Pendaftaran gagal (${regRes.status}).`;
        setErrorMsg(msg);
        setSubmitting(false);
        return;
      }

      // Store credentials for future Google logins
      localStorage.setItem(`google_creds_${gUser.email}`, JSON.stringify({ username: form.username.trim(), password }));

      // Auto-login
      setStage("logging_in");
      setStatusMsg("Akun berhasil dibuat, sedang masuk...");
      await doLogin(form.username.trim(), password, gUser);
    } catch {
      setErrorMsg("Tidak dapat terhubung ke server. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  }

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (touched[name as keyof FormState]) setErrors(validateForm(updated));
  }

  function blur(field: keyof FormState) {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(validateForm(form));
  }

  // ── Loading / auto-login ──
  if (stage === "loading" || stage === "logging_in" || stage === "done") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, border: "4px solid #d1fae5", borderTopColor: "#10b981",
            borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ fontSize: 15, color: "#475569", fontWeight: 500 }}>{statusMsg}</p>
        </div>
        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Completion form (first-time Google user) ──
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: "24px 20px" }}>
      <div style={{ width: "100%", maxWidth: 480, animation: "fadeIn 0.4s ease-out both" }}>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", boxShadow: "0 8px 40px rgba(0,0,0,0.09)" }}>

          {/* Google profile header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #f1f5f9" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", overflow: "hidden", border: "2.5px solid #a7f3d0", flexShrink: 0 }}>
              {gUser?.picture ? (
                <img src={gUser.picture} alt={gUser.name} width={52} height={52} style={{ objectFit: "cover" }} />
              ) : (
                <div style={{ width: 52, height: 52, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#10b981" }}>
                  {gUser?.name[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 10px", background: "#dcfce7", borderRadius: 20, marginBottom: 4 }}>
                <svg viewBox="0 0 20 20" fill="none" stroke="#16a34a" strokeWidth="2.2" width="11" height="11" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8"/></svg>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>Terverifikasi Google</span>
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{gUser?.name}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{gUser?.email}</p>
            </div>
          </div>

          <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: "#064e3b" }}>Lengkapi Data Petani</h2>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
            Ini hanya perlu dilakukan sekali. Login Google berikutnya akan langsung masuk otomatis.
          </p>

          {errorMsg && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "12px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#b91c1c", fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Username */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Username <span style={{ color: "#dc2626" }}>*</span></label>
              <input
                name="username" value={form.username} onChange={update} onBlur={() => blur("username")}
                placeholder="Contoh: budi_santoso"
                style={inputStyle(touched.username && !!errors.username)}
              />
              {touched.username && errors.username && <p style={errStyle}>{errors.username}</p>}
            </div>

            {/* NIK */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                NIK <span style={{ color: "#dc2626" }}>*</span>
                <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: 4 }}>(Nomor Induk Kependudukan — 16 digit)</span>
              </label>
              <input
                name="nik" value={form.nik} onChange={update} onBlur={() => blur("nik")}
                placeholder="3201xxxxxxxxxxxx" maxLength={16} inputMode="numeric"
                style={inputStyle(touched.nik && !!errors.nik)}
              />
              {touched.nik && errors.nik && <p style={errStyle}>{errors.nik}</p>}
            </div>

            {/* Phone (optional) */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>No. HP <span style={{ fontWeight: 400, color: "#94a3b8" }}>(opsional)</span></label>
              <input
                name="phone" value={form.phone} onChange={update} onBlur={() => blur("phone")}
                placeholder="08123456789" inputMode="tel"
                style={inputStyle(touched.phone && !!errors.phone)}
              />
              {touched.phone && errors.phone && <p style={errStyle}>{errors.phone}</p>}
            </div>

            {/* Address (optional) */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Alamat <span style={{ fontWeight: 400, color: "#94a3b8" }}>(opsional)</span></label>
              <textarea
                name="address" value={form.address} onChange={update}
                placeholder="Jl. Contoh No. 1, Desa..."
                rows={2}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", color: "#0f172a", lineHeight: 1.5 }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%", height: 48, background: submitting ? "#6b7280" : "#10b981",
                color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
                fontFamily: "inherit", cursor: submitting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 0.2s", boxShadow: submitting ? "none" : "0 2px 8px rgba(16,185,129,0.3)",
              }}>
              {submitting ? (
                <><span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Memproses...</>
              ) : "Daftar & Masuk Sekarang →"}
            </button>
          </form>
        </div>

        {/* Back */}
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <button
            onClick={() => { localStorage.removeItem("google_pending_user"); router.push("/login"); }}
            style={{ background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer" }}>
            ← Kembali ke halaman login
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6,
};

function inputStyle(hasError: boolean | undefined): React.CSSProperties {
  return {
    width: "100%", height: 44, padding: "0 14px",
    borderRadius: 10, border: `1px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`,
    fontSize: 14, fontFamily: "inherit", outline: "none",
    boxSizing: "border-box", color: "#0f172a",
    background: hasError ? "#fff5f5" : "#fff",
  };
}

const errStyle: React.CSSProperties = {
  margin: "4px 0 0", fontSize: 12, color: "#dc2626",
};
