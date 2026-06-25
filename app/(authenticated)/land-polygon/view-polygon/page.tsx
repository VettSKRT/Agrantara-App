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
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, color: "#374151", cursor: "pointer" }}
        >
          ← Kembali
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
