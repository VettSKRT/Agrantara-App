"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function GoogleAuthPage() {
  const router = useRouter();
  const [gUser, setGUser] = useState<{ name: string; email: string; picture?: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("google_pending_user");
      if (!raw) { router.push("/login"); return; }
      setGUser(JSON.parse(raw));
    } catch {
      router.push("/login");
    }
  }, []);

  if (!gUser) return null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 460, animation: "fadeIn 0.4s ease-out both" }}>
        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "36px 32px", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", textAlign: "center" }}>
          {/* Google badge */}
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: gUser.picture ? "transparent" : "#ecfdf5", margin: "0 auto 16px", overflow: "hidden", border: "3px solid #a7f3d0" }}>
            {gUser.picture ? (
              <img src={gUser.picture} alt={gUser.name} width={64} height={64} style={{ objectFit: "cover" }} />
            ) : (
              <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#10b981" }}>
                {gUser.name[0]?.toUpperCase()}
              </div>
            )}
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", background: "#dcfce7", borderRadius: 20, marginBottom: 16 }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="#16a34a" strokeWidth="2.2" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10l4 4 8-8"/></svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a" }}>Akun Google Terverifikasi</span>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Halo, {gUser.name.split(" ")[0]}!</h2>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 28px", lineHeight: 1.6 }}>
            Masuk sebagai <strong>{gUser.email}</strong>. Untuk menggunakan fitur Agrantara, hubungkan dengan akun petani Anda.
          </p>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => router.push("/login")}
              style={{ width: "100%", padding: "12px", background: "#10b981", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Login dengan Akun Agrantara
            </button>
            <button
              onClick={() => router.push("/register")}
              style={{ width: "100%", padding: "12px", background: "#fff", color: "#064e3b", border: "2px solid #10b981", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Daftar Akun Baru
            </button>
          </div>

          <p style={{ marginTop: 20, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
            Agrantara menggunakan sistem autentikasi sendiri untuk keamanan data petani. Google digunakan untuk verifikasi identitas awal.
          </p>
        </div>

        {/* Back */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => { localStorage.removeItem("google_pending_user"); router.push("/login"); }}
            style={{ background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer" }}>
            ← Kembali ke halaman login
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
