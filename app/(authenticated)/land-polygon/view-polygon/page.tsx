"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const MapDrawComponent = dynamic(
  () => import("@/components/map/MapDrawComponent"),
  { ssr: false, loading: () => <p style={{ padding: 24, color: "#64748b" }}>Menyiapkan peta...</p> }
);

export default function ViewPolygonPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [landId, setLandId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("access_token") || "";
      if (!t) { router.push("/login"); return; }
      setToken(t);
      const params = new URLSearchParams(window.location.search);
      setLandId(params.get("id"));
      setMounted(true);
    }
  }, []);

  if (!mounted) return <p style={{ padding: 24, color: "#64748b" }}>Memuat...</p>;

  if (!landId) {
    return (
      <div style={{ padding: 24, color: "#dc2626", fontWeight: 600 }}>
        ID Lahan tidak ditemukan. Silakan kembali ke daftar lahan.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={() => router.back()}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, border: "1.5px solid #a7f3d0", background: "linear-gradient(135deg,#ecfdf5,#f0fdf4)", fontSize: 13, fontWeight: 600, color: "#065f46", cursor: "pointer", transition: "all 0.18s", boxShadow: "0 1px 4px rgba(16,185,129,0.1)" }}
          onMouseEnter={e => { Object.assign(e.currentTarget.style, { background: "linear-gradient(135deg,#d1fae5,#ecfdf5)", borderColor: "#6ee7b7", boxShadow: "0 3px 10px rgba(16,185,129,0.2)", transform: "translateX(-2px)" }); }}
          onMouseLeave={e => { Object.assign(e.currentTarget.style, { background: "linear-gradient(135deg,#ecfdf5,#f0fdf4)", borderColor: "#a7f3d0", boxShadow: "0 1px 4px rgba(16,185,129,0.1)", transform: "translateX(0)" }); }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
          Kembali
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Detail Batas Polygon Lahan</h2>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b" }}>Tampilan batas wilayah lahan (read-only)</p>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24 }}>
        <MapDrawComponent landId={landId} token={token} readOnly={true} />
      </div>
    </div>
  );
}
