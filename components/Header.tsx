"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const IcoLeaf = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" width="20" height="20" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 19c0-7 5-13 14-14-3 7-7 12-14 14z"/><path d="M5 19l5-5"/>
  </svg>
);
const IcoUser = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="6" r="3.5"/><path d="M2.5 18c0-4 3.1-7 7.5-7s7.5 3 7.5 7"/>
  </svg>
);
const IcoLock = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="9" width="12" height="9" rx="2"/><path d="M7 9V6a3 3 0 016 0v3"/>
  </svg>
);
const IcoLogout = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 3h4v14h-4M9 14l4-4-4-4M13 10H4"/>
  </svg>
);

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [user, setUser]           = useState<{ full_name?: string; username?: string; role?: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPwModal, setShowPwModal]   = useState(false);
  const [pwForm, setPwForm]   = useState({ current: "", newPass: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError]     = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  const displayName = user?.full_name || user?.username || "Pengguna";
  const initials    = displayName.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();

  function handleLogout() {
    localStorage.clear();
    router.push("/login");
  }

  function openPwModal() {
    setShowDropdown(false);
    setPwForm({ current: "", newPass: "", confirm: "" });
    setPwError(""); setPwSuccess("");
    setShowPwModal(true);
  }

  async function handlePwSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pwForm.current) { setPwError("Password saat ini wajib diisi."); return; }
    if (pwForm.newPass.length < 8) { setPwError("Password baru minimal 8 karakter."); return; }
    if (pwForm.newPass !== pwForm.confirm) { setPwError("Konfirmasi password tidak cocok."); return; }
    const token = localStorage.getItem("access_token") || "";
    setPwLoading(true); setPwError(""); setPwSuccess("");
    try {
      const body = new URLSearchParams();
      body.append("current_password", pwForm.current);
      body.append("new_password", pwForm.newPass);
      body.append("confirm_password", pwForm.confirm);
      const res = await fetch("/api/proxy/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Bearer ${token}` },
        body: body.toString(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        setPwError(data.message || data.msg || `Error ${res.status}`);
        return;
      }
      setPwSuccess("Password berhasil diubah!");
      setTimeout(() => setShowPwModal(false), 1500);
    } catch {
      setPwError("Tidak dapat terhubung ke server.");
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <>
      <header className="agr-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="agr-hamburger" onClick={onMenuClick} aria-label="Toggle menu">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <div className="agr-header-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IcoLeaf />
            <span style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Agrantara</span>
          </div>
        </div>

        {/* User badge with dropdown */}
        <div ref={dropRef} style={{ position: "relative" }}>
          <button className="agr-user-btn" onClick={() => setShowDropdown(d => !d)} title="Menu akun">
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{displayName}</div>
              <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "Active Farmer"}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#10b981,#047857)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 14, flexShrink: 0 }}>
              {initials || "?"}
            </div>
          </button>

          {showDropdown && (
            <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 200, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{displayName}</div>
                <div style={{ fontSize: 11, color: "#16a34a" }}>{user?.role || "Farmer"}</div>
              </div>
              {[
                { label: "Profil", icon: <IcoUser />, action: () => { setShowDropdown(false); router.push("/profile"); } },
                { label: "Ubah Password", icon: <IcoLock />, action: openPwModal },
              ].map((item) => (
                <button key={item.label} onClick={item.action}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "none", border: "none", fontSize: 13, color: "#374151", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0fdf4")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <span style={{ color: "#10b981" }}>{item.icon}</span> {item.label}
                </button>
              ))}
              <div style={{ borderTop: "1px solid #f1f5f9" }}>
                <button onClick={handleLogout}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "none", border: "none", fontSize: 13, color: "#dc2626", cursor: "pointer", textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <IcoLogout /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Change Password Modal */}
      {showPwModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Ubah Password</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Masukkan password lama dan password baru</p>
              </div>
              <button onClick={() => setShowPwModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 20, lineHeight: 1 }}>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" strokeLinecap="round"><path d="M4 4l12 12M16 4L4 16"/></svg>
              </button>
            </div>

            {pwError && <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#b91c1c", fontSize: 13, marginBottom: 16 }}>{pwError}</div>}
            {pwSuccess && <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, color: "#15803d", fontSize: 13, marginBottom: 16 }}>{pwSuccess}</div>}

            <form onSubmit={handlePwSubmit}>
              {[
                { label: "Password Saat Ini", key: "current" as const, placeholder: "Masukkan password lama" },
                { label: "Password Baru", key: "newPass" as const, placeholder: "Minimal 8 karakter" },
                { label: "Konfirmasi Password Baru", key: "confirm" as const, placeholder: "Ulangi password baru" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{f.label}</label>
                  <input
                    type="password" placeholder={f.placeholder}
                    value={pwForm[f.key]}
                    onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: "100%", height: 42, padding: "0 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setShowPwModal(false)} style={{ flex: 1, height: 42, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer", color: "#374151" }}>
                  Batal
                </button>
                <button type="submit" disabled={pwLoading} style={{ flex: 1, height: 42, borderRadius: 8, border: "none", background: pwLoading ? "#6b7280" : "#10b981", color: "#fff", fontSize: 14, fontWeight: 600, cursor: pwLoading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  {pwLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
