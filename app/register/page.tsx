"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

interface FormState {
  full_name: string;
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  nik: string;
  phone: string;
  address: string;
}

interface Errors {
  full_name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
  nik?: string;
  phone?: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+62|62|0)[0-9]{8,12}$/;
const nikRegex = /^[0-9]{16}$/;

function validate(form: FormState): Errors {
  const e: Errors = {};
  if (!form.full_name.trim()) e.full_name = "Nama lengkap wajib diisi.";
  else if (form.full_name.trim().length < 3) e.full_name = "Nama minimal 3 karakter.";

  if (!form.username.trim()) e.username = "Username wajib diisi.";
  else if (form.username.trim().length < 3) e.username = "Username minimal 3 karakter.";
  else if (!/^[a-zA-Z0-9_]+$/.test(form.username.trim())) e.username = "Username hanya boleh huruf, angka, dan underscore.";

  if (!form.email.trim()) e.email = "Email wajib diisi.";
  else if (!emailRegex.test(form.email.trim())) e.email = "Format email tidak valid.";

  if (!form.password) e.password = "Password wajib diisi.";
  else if (form.password.length < 8) e.password = "Password minimal 8 karakter.";

  if (!form.confirm_password) e.confirm_password = "Konfirmasi password wajib diisi.";
  else if (form.password !== form.confirm_password) e.confirm_password = "Password tidak cocok.";

  if (!form.nik.trim()) e.nik = "NIK wajib diisi.";
  else if (!nikRegex.test(form.nik.trim())) e.nik = "NIK harus 16 digit angka.";
  if (form.phone && !phoneRegex.test(form.phone.replace(/\s/g, ""))) e.phone = "Format nomor HP tidak valid (contoh: 08123456789).";

  return e;
}

/* ─── Field defined OUTSIDE page component to prevent focus-loss on re-render ─── */
interface FieldProps {
  label: string;
  name: keyof FormState;
  type?: string;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
  form: FormState;
  touched: Partial<Record<keyof FormState, boolean>>;
  errors: Errors;
  showPass: boolean;
  showConfirm: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (field: keyof FormState) => void;
  onTogglePass: () => void;
  onToggleConfirm: () => void;
}

function Field({
  label, name, type = "text", placeholder, required = false, textarea = false,
  form, touched, errors, showPass, showConfirm, onChange, onBlur, onTogglePass, onToggleConfirm,
}: FieldProps) {
  const err = touched[name] ? errors[name as keyof Errors] : undefined;
  const isPass = name === "password" || name === "confirm_password";
  const showToggle = name === "password" ? showPass : showConfirm;
  const handleToggle = name === "password" ? onTogglePass : onToggleConfirm;

  return (
    <div className="reg-field">
      <label htmlFor={name} className="reg-label">
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        {textarea ? (
          <textarea
            id={name} name={name} placeholder={placeholder}
            value={form[name]} onChange={onChange} onBlur={() => onBlur(name)}
            rows={3}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${err ? "#fca5a5" : "#e2e8f0"}`, fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box", background: err ? "#fff5f5" : "#fff" }}
          />
        ) : (
          <input
            id={name} name={name}
            type={isPass ? (showToggle ? "text" : "password") : type}
            placeholder={placeholder}
            value={form[name]} onChange={onChange} onBlur={() => onBlur(name)}
            autoComplete={name === "confirm_password" ? "new-password" : name}
            style={{ width: "100%", height: 44, padding: `0 ${isPass ? "44px" : "14px"} 0 14px`, borderRadius: 10, border: `1px solid ${err ? "#fca5a5" : "#e2e8f0"}`, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: err ? "#fff5f5" : "#fff", color: "#0f172a" }}
          />
        )}
        {isPass && (
          <button
            type="button"
            onClick={handleToggle}
            tabIndex={-1}
            style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", display: "flex", padding: 4, borderRadius: 6 }}
            aria-label={showToggle ? "Sembunyikan" : "Tampilkan"}
          >
            <EyeIcon open={showToggle} />
          </button>
        )}
      </div>
      {err && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>{err}</p>}
    </div>
  );
}

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    full_name: "", username: "", email: "", password: "",
    confirm_password: "", nik: "", phone: "", address: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") return;

    const handleCredential = (response: { credential: string }) => {
      try {
        const payload = JSON.parse(atob(response.credential.split(".")[1]));
        localStorage.setItem("google_pending_user", JSON.stringify({
          name: payload.name || payload.email,
          email: payload.email,
          picture: payload.picture,
        }));
        router.push("/google-auth");
      } catch {
        setServerError("Gagal memproses akun Google. Coba lagi.");
      }
    };

    const init = () => {
      (window as any).google?.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredential });
      if (googleBtnRef.current) {
        (window as any).google?.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard", theme: "outline", size: "large", text: "signup_with", locale: "id", width: "400",
        });
      }
    };

    if ((window as any).google?.accounts) { init(); return; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = init;
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, []);

  function update(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (touched[name as keyof FormState]) {
      setErrors(validate(updated));
    }
  }

  function handleBlur(field: keyof FormState) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(form));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setServerError("");
    try {
      const body = new URLSearchParams();
      body.append("full_name", form.full_name.trim());
      body.append("username", form.username.trim());
      body.append("email", form.email.trim());
      body.append("password", form.password);
      body.append("nik", form.nik.trim());
      body.append("phone", form.phone.trim());
      body.append("address", form.address.trim());

      const res = await fetch("/api/proxy/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        const isNikDuplicate = (s: string) => {
          const l = s.toLowerCase();
          return l.includes("nik") && (l.includes("taken") || l.includes("unique") || l.includes("duplicate") || l.includes("exist") || l.includes("terdaftar") || l.includes("sudah"));
        };
        let errorMsg = "";
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          const nikErr = data.errors.find((e: any) => typeof e === "string" && isNikDuplicate(e));
          errorMsg = nikErr ? "NIK sudah terdaftar, gunakan NIK yang berbeda." : data.errors.join(" • ");
        }
        if (!errorMsg) {
          const raw = data.error_raw || data.message || data.msg || "";
          if (isNikDuplicate(String(raw))) errorMsg = "NIK sudah terdaftar, gunakan NIK yang berbeda.";
          else errorMsg = String(raw) || `Pendaftaran gagal (Error ${res.status})`;
        }
        setServerError(errorMsg);
        return;
      }

      router.push("/login");
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }

  const fieldProps = {
    form, touched, errors, showPass, showConfirm,
    onChange: update, onBlur: handleBlur,
    onTogglePass:    () => setShowPass(p => !p),
    onToggleConfirm: () => setShowConfirm(p => !p),
  };

  return (
    <div className="reg-root">
      {/* Left Panel */}
      <div className="reg-left">
        <div className="reg-left-inner">
          <div className="reg-logo">
            <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#ecfdf5" />
              <path d="M14 6v16M8 12l6 6 6-6" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>agrantara</span>
          </div>
          <div className="reg-tagline">
            <h2>Bergabung sebagai Petani</h2>
            <p>Daftarkan diri Anda untuk mengakses sistem manajemen lahan dan kepatuhan EUDR terintegrasi.</p>
          </div>
          <div className="reg-bullets">
            {["Manajemen lahan berbasis peta digital", "Pemetaan polygon batas lahan presisi", "Kepatuhan EUDR & sertifikasi ekspor", "Siklus tanam dan log aktivitas lengkap"].map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <span style={{ fontSize: 13, color: "#a7f3d0" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="reg-right">
        <div className="reg-wrap">
          {/* Mobile logo */}
          <div className="reg-mobile-logo">
            <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#10b981" />
              <path d="M14 6v16M8 12l6 6 6-6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontWeight: 700, fontSize: 20, color: "#064e3b" }}>agrantara</span>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#064e3b", letterSpacing: "-0.5px" }}>Daftar Akun Petani</h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>Lengkapi data diri Anda untuk memulai</p>
          </div>

          {serverError && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, color: "#b91c1c", fontSize: 13, marginBottom: 20 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Section: Data Akun */}
            <div className="reg-section-label">Data Akun</div>
            <div className="reg-grid-2">
              <Field label="Nama Lengkap" name="full_name" placeholder="Contoh: Budi Santoso" required {...fieldProps} />
              <Field label="Username" name="username" placeholder="Contoh: budi123" required {...fieldProps} />
            </div>
            <Field label="Email" name="email" type="email" placeholder="contoh@email.com" required {...fieldProps} />
            <div className="reg-grid-2">
              <Field label="Password" name="password" placeholder="Min. 8 karakter" required {...fieldProps} />
              <Field label="Konfirmasi Password" name="confirm_password" placeholder="Ulangi password" required {...fieldProps} />
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "20px 0" }} />

            {/* Section: Data Diri */}
            <div className="reg-section-label">Data Diri</div>
            <div className="reg-grid-2">
              <Field label="NIK (16 digit)" name="nik" placeholder="3201xxxxxxxxxxxx" required {...fieldProps} />
              <Field label="No. HP" name="phone" placeholder="0812xxxxxxxx" {...fieldProps} />
            </div>
            <Field label="Alamat" name="address" placeholder="Jl. Contoh No. 1, Desa..." textarea {...fieldProps} />

            <button type="submit" disabled={loading} style={{
              width: "100%", height: 46, marginTop: 8, background: loading ? "#6b7280" : "#10b981",
              color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600,
              fontFamily: "inherit", cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "background 0.2s", boxShadow: "0 2px 4px rgba(16,185,129,0.2)"
            }}>
              {loading ? (
                <><span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Mendaftarkan...</>
              ) : "Daftar Sekarang →"}
            </button>
          </form>

          {/* Google Sign-Up */}
          {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE" && (
            <>
              <div className="agr-oauth-divider" style={{ margin: "20px 0" }}>atau daftar dengan</div>
              <div ref={googleBtnRef} style={{ display: "flex", justifyContent: "center", marginBottom: 8 }} />
            </>
          )}

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748b" }}>
            Sudah punya akun?{" "}
            <button onClick={() => router.push("/login")} style={{ background: "none", border: "none", color: "#10b981", fontWeight: 600, cursor: "pointer", fontSize: 14, padding: 0 }}>
              Masuk di sini
            </button>
          </p>
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#94a3b8" }}>© 2026 Agrantara Tech. All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }

        .reg-root { display: flex; min-height: 100vh; }

        /* Left */
        .reg-left {
          width: 420px; flex-shrink: 0; background: #064e3b;
          display: flex; align-items: center; padding: 60px 48px;
          position: relative; overflow: hidden;
        }
        .reg-left::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at 20% 20%, rgba(16,185,129,0.25) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(167,243,208,0.1) 0%, transparent 40%);
        }
        .reg-left-inner { position: relative; z-index: 1; }
        .reg-logo { display: flex; align-items: center; gap: 12px; margin-bottom: 36px; }
        .reg-logo span { font-size: 26px; font-weight: 700; color: #fff; letter-spacing: -1px; }
        .reg-tagline h2 { font-size: 20px; font-weight: 700; color: #fff; margin: 0 0 10px; }
        .reg-tagline p { font-size: 14px; color: #a7f3d0; line-height: 1.6; margin: 0 0 24px; }

        /* Right */
        .reg-right {
          flex: 1; display: flex; align-items: flex-start; justify-content: center;
          padding: 48px 24px; background: #fcfdfd; overflow-y: auto;
        }
        .reg-wrap { width: 100%; max-width: 520px; animation: fadeIn 0.45s ease-out both; }

        .reg-mobile-logo { display: none; align-items: center; gap: 10px; justify-content: center; margin-bottom: 24px; }

        .reg-section-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }

        .reg-field { margin-bottom: 16px; }
        .reg-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
        .reg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        @media (max-width: 900px) {
          .reg-left { width: 320px; padding: 48px 36px; }
        }
        @media (max-width: 700px) {
          .reg-left { display: none; }
          .reg-mobile-logo { display: flex; }
          .reg-grid-2 { grid-template-columns: 1fr; }
          .reg-right { padding: 32px 20px; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}
