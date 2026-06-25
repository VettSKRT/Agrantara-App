"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
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
        setError("Gagal memproses akun Google. Coba lagi.");
      }
    };

    const init = () => {
      (window as any).google?.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleCredential });
      if (googleBtnRef.current) {
        (window as any).google?.accounts.id.renderButton(googleBtnRef.current, {
          type: "standard", theme: "outline", size: "large", text: "signin_with", locale: "id", width: "380",
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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const formUsername = (formData.get("username") as string | null) ?? "";
    const formPassword = (formData.get("password") as string | null) ?? "";

    const trimmedUsername = formUsername.trim();
    const trimmedPassword = formPassword.trim();

    setLoading(true);

    try {
      const formBody = new URLSearchParams();
      formBody.append("username", trimmedUsername);
      formBody.append("password", trimmedPassword);

      const res = await fetch("/api/proxy/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "omit",
        body: formBody.toString(),
      });
      
      const data = await res.json();

      if (!data.success || !data.data?.access_token) {
        setError(data.message || "Username atau password salah.");
        return;
      }
      
      localStorage.setItem("access_token", data.data.access_token);
      localStorage.setItem("token_type", data.data.token_type);
      localStorage.setItem("expired_at", data.data.expired_at);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      router.push("/dashboard");
    } catch {
      setError("Tidak dapat terhubung ke server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="root">
      {/* Panel Kiri - Hanya muncul di Desktop */}
      <div className="left">
        <div className="left-inner">
          <div className="logo">
            <img src="/logo-icon.png" alt="Agrantara" width={32} height={32} style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} />
            <span>agrantara</span>
          </div>
          <div className="quote">
            <p>"Solusi digital terpadu untuk efisiensi pertanian dan perkebunan Indonesia."</p>
          </div>
        </div>
      </div>

      {/* Panel Kanan - Form Login */}
      <div className="right">
        <div className="form-wrap">
          <div className="form-header">
            {/* Logo Mobile - Muncul saat layar kecil */}
            <div className="mobile-logo logo">
              <img src="/logo-icon.png" alt="Agrantara" width={28} height={28} style={{ objectFit: "contain" }} />
              <span>agrantara</span>
            </div>
            <h1>Selamat Datang</h1>
            <p>Masuk dengan akun Agrantara Anda</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                  aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showPass ? (
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
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="error" aria-live="assertive">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : "Masuk"}
            </button>
          </form>

          {/* Google Sign-In */}
          {GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "YOUR_GOOGLE_CLIENT_ID_HERE" && (
            <>
              <div className="agr-oauth-divider">atau masuk dengan</div>
              <div ref={googleBtnRef} style={{ display: "flex", justifyContent: "center" }} />
            </>
          )}

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#64748b" }}>
            Belum punya akun?{" "}
            <a href="/register" style={{ color: "#10b981", fontWeight: 600, textDecoration: "none" }}>
              Daftar sekarang
            </a>
          </p>

          <p className="footer-note">© 2026 Agrantara Tech. All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        .root {
          display: flex;
          min-height: 100vh;
        }

        /* --- Left panel --- */
        .left {
          width: 450px;
          flex-shrink: 0;
          background: var(--bg-green);
          display: flex;
          align-items: flex-end;
          padding: 60px 50px;
          position: relative;
          overflow: hidden;
        }

        .left::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(167, 243, 208, 0.1) 0%, transparent 40%);
        }

        .left-inner {
          position: relative;
          z-index: 1;
          width: 100%;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }

        .left .logo {
          position: absolute;
          top: -380px;
          left: 0;
        }

        .logo span {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -1px;
        }

        .quote p {
          font-size: 17px;
          line-height: 1.6;
          color: var(--accent-green);
          font-weight: 400;
          letter-spacing: -0.1px;
          border-left: 3px solid var(--primary-green);
          padding-left: 16px;
        }

        /* --- Right panel --- */
        .right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          background: #fcfdfd;
        }

        .form-wrap {
          width: 100%;
          max-width: 380px;
          animation: fadeIn 0.5s ease-out both;
        }

        .form-header {
          margin-bottom: 36px;
        }

        .mobile-logo {
          display: none;
          justify-content: center;
          margin-bottom: 24px;
        }

        .mobile-logo span {
          color: var(--bg-green);
          font-size: 22px;
        }

        .form-header h1 {
          font-size: 28px;
          font-weight: 700;
          color: var(--bg-green);
          letter-spacing: -0.8px;
          margin-bottom: 8px;
        }

        .form-header p {
          font-size: 15px;
          color: var(--text-sub);
          font-weight: 400;
        }

        /* Fields */
        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        label {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }

        input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          font-size: 15px;
          font-family: inherit;
          color: var(--text-main);
          background: #fff;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          outline: none;
          transition: all 0.2s;
        }

        input::placeholder {
          color: #cbd5e1;
        }

        input:focus {
          border-color: var(--primary-green);
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }

        .input-wrap {
          position: relative;
        }

        .input-wrap input {
          padding-right: 44px;
        }

        .toggle-pass {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.15s;
        }

        .toggle-pass:hover {
          color: var(--primary-green);
          background-color: #f0fdf4;
        }

        /* Error */
        .error {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #b91c1c;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 20px;
          animation: shake 0.4s linear;
        }

        /* Submit Button */
        .submit {
          width: 100%;
          height: 46px;
          background: var(--primary-green);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: -0.1px;
          margin-top: 10px;
          box-shadow: 0 2px 4px rgba(16, 185, 129, 0.15);
        }

        .submit:hover:not(:disabled) {
          background: var(--hover-green);
        }

        .submit:active:not(:disabled) {
          transform: translateY(1px);
        }

        .submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          box-shadow: none;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .footer-note {
          margin-top: 40px;
          font-size: 13px;
          color: #94a3b8;
          text-align: center;
        }

        /* Responsif Layout */
        @media (max-width: 850px) {
          .left {
            width: 300px;
            padding: 40px;
          }
          .left .logo { top: -300px; }
          .logo span { font-size: 20px; }
          .quote p { font-size: 15px; }
        }

        @media (max-width: 700px) {
          .left {
            display: none;
          }
          .mobile-logo {
            display: flex;
          }
          .form-header h1 {
            font-size: 24px;
            text-align: center;
          }
          .form-header p {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}