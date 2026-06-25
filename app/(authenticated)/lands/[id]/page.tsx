"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const LandMap = dynamic(() => import("@/components/map/LandMap"), {
  ssr: false,
  loading: () => <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#64748b" }}>Memuat Peta Lokasi...</div>
});

const MapDrawComponent = dynamic(() => import("@/components/map/MapDrawComponent"), {
  ssr: false,
  loading: () => <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#64748b" }}>Memuat Peta Polygon...</div>
});

const IconLeft = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
    <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconEdit = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconTrash = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15">
    <path d="M3 6h14M8 6V4a2 2 0 012-2h0a2 2 0 012 2v2m3 0v11a2 2 0 01-2 2H7a2 2 0 01-2-2V6h10" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 11v4M12 11v4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "#64748b",
  marginBottom: 4,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const valueStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 600,
  color: "#0f172a",
  margin: 0,
};

const boxInfoStyle: React.CSSProperties = {
  padding: "12px 16px",
  background: "#f8fafc",
  borderRadius: 8,
  border: "1px solid #f1f5f9",
};

interface Commodity {
  id: string | number;
  name: string;
}

export default function DetailLandPage() {
  const params = useParams();
const id = params?.id ? String(params.id) : "";
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [delLoading, setDelLoading] = useState(false);
  const [showDelModal, setShowDelModal] = useState(false);
  const [leafletReady, setLeafletReady] = useState(false);
  const [token, setToken] = useState("");
  const [hasLocalPolygon, setHasLocalPolygon] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("access_token");
    if (!t) { router.push("/login"); return; }
    setToken(t);
    setHasLocalPolygon(!!localStorage.getItem(`polygon_land_${id}`));

    Promise.all([
      fetch(`/api/proxy/land/view/${id}`, { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()),
      fetch("/api/proxy/commodity/index", { headers: { Authorization: `Bearer ${t}` } }).then(r => r.json()).catch(() => ({ data: [] }))
    ])
      .then(([landRes, commodityRes]) => {
        if (landRes.status && landRes.data) {
          setData(landRes.data);
        } else {
          toast.error(landRes.msg || "Gagal memuat data lahan");
        }
        if (commodityRes.success && commodityRes.data) {
          setCommodities(commodityRes.data);
        }
      })
      .catch((err) => console.error("Error fetching data:", err))
      .finally(() => setLoading(false));

    // Siapkan asset marker Leaflet di client-side
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        });
        setLeafletReady(true);
      });
    }
  }, [id, router]);

  // Fungsi internal untuk me-lookup ID ke Nama Komoditas secara presisi
  function getCommodityName() {
    // 1. Cek dulu apakah API Yii2 Anda sebenarnya sudah menyertakan relasi objeknya (misal: data.commodity.name)
    if (data?.commodity?.name) {
      return data.commodity.name;
    }

    // 2. Jika tidak ada, lakukan pencarian manual (lookup) ke dalam master state `commodities`
    const found = commodities.find(c => String(c.id) === String(data?.commodity_id));
    return found ? found.name : `ID Komoditas: ${data?.commodity_id}`;
  }

  async function handleDelete() {
    const t = localStorage.getItem("access_token") || "";
    setDelLoading(true);
    try {
      const res = await fetch(`/api/proxy/land/delete/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams().toString(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      localStorage.removeItem(`polygon_land_${id}`);
      router.push("/lands");
    } catch (err) {
      toast.error("Gagal menghapus data lahan");
      console.error(err);
    } finally {
      setDelLoading(false);
      setShowDelModal(false);
    }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#64748b" }}>
        Memuat detail data lahan...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: "#dc2626" }}>
        Data lahan tidak ditemukan atau Anda tidak memiliki akses.
      </div>
    );
  }

  const latNum = parseFloat(data.latitude) || -6.9175;
  const lngNum = parseFloat(data.longitude) || 107.6191;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button type="button" onClick={() => router.push("/lands")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, color: "#374151", cursor: "pointer" }}>
            <IconLeft/> Kembali
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{data.land_name || "Detail Lahan"}</h2>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b" }}>Manajemen data spasial dan komoditas perkebunan</p>
          </div>
        </div>

        {/* Action Buttons Top */}
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={() => router.push(`/lands/${id}/edit`)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid #cbd5e1", background: "#fff", fontSize: 13, fontWeight: 500, color: "#334155", cursor: "pointer" }}>
            <IconEdit/> Edit Lahan
          </button>
          <button type="button" onClick={() => setShowDelModal(true)} disabled={delLoading} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "none", background: "#ef4444", fontSize: 13, fontWeight: 500, color: "#fff", cursor: "pointer" }}>
            <IconTrash/> Hapus
          </button>
        </div>
      </div>

      {/* Detail Informasi Lahan Card */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>Informasi Utama</div>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px 0" }}>Data komoditas tanaman beserta total luas area lahan</p>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          
          <div style={{ gridColumn: "1/-1", ...boxInfoStyle }}>
            <label style={labelStyle}>Nama Wilayah Lahan</label>
            <p style={valueStyle}>{data.land_name || "-"}</p>
          </div>

          {/* Memanggil fungsi getCommodityName() */}
          <div style={boxInfoStyle}>
            <label style={labelStyle}>Komoditas Tanaman</label>
            <p style={{ ...valueStyle, color: "#16a34a" }}>{getCommodityName()}</p>
          </div>

          <div style={boxInfoStyle}>
            <label style={labelStyle}>Total Luas Wilayah</label>
            <p style={valueStyle}>{data.total_area_hectares ? `${data.total_area_hectares} Hektar` : "-"}</p>
          </div>

        </div>
      </div>

      {/* Peta Lokasi Geografis Card */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>Peta Citra Satelit Lokasi</div>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px 0" }}>Lokasi lahan aktual yang ditandai dengan pin titik koordinat</p>

        <div style={{ height: 400, width: "100%", borderRadius: 8, overflow: "hidden", marginBottom: 20, border: "1px solid #cbd5e1" }}>
          {leafletReady && (
            <LandMap latNum={latNum} lngNum={lngNum} zoomNum={15} readOnly={true} />
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={boxInfoStyle}>
            <label style={labelStyle}>Garis Lintang (Latitude)</label>
            <p style={{ ...valueStyle, fontFamily: "monospace" }}>{data.latitude || "-"}</p>
          </div>
          <div style={boxInfoStyle}>
            <label style={labelStyle}>Garis Bujur (Longitude)</label>
            <p style={{ ...valueStyle, fontFamily: "monospace" }}>{data.longitude || "-"}</p>
          </div>
        </div>
      </div>

      {/* Polygon Batas Lahan Card */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#0f172a" }}>Polygon Batas Lahan</div>
          <button
            onClick={() => router.push(`/land-polygon/manage-polygon?id=${id}`)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: hasLocalPolygon ? "1px solid #bbf7d0" : "none", background: hasLocalPolygon ? "#f0fdf4" : "#064e3b", color: hasLocalPolygon ? "#15803d" : "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            {hasLocalPolygon ? "Edit Polygon" : "Tambah Polygon"}
          </button>
        </div>
        <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px 0" }}>
          {hasLocalPolygon ? "Batas wilayah lahan dalam sistem koordinat geografis" : "Belum ada batas polygon untuk lahan ini"}
        </p>
        {hasLocalPolygon && leafletReady ? (
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            <MapDrawComponent landId={id} token={token} readOnly={true} />
          </div>
        ) : (
          <div style={{ background: "#f8fafc", border: "2px dashed #e2e8f0", borderRadius: 10, padding: "40px 24px", textAlign: "center" }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" width="24" height="24" strokeLinecap="round" strokeLinejoin="round"><path d="M1 5l7-3 8 3 7-3v16l-7 3-8-3-7 3V5z"/></svg>
            </div>
            <p style={{ margin: 0, fontSize: 14, color: "#64748b", fontWeight: 500 }}>Polygon belum dipetakan</p>
            <p style={{ margin: "4px 0 16px", fontSize: 12, color: "#94a3b8" }}>Tambahkan batas lahan untuk validasi spasial EUDR</p>
            <button onClick={() => router.push(`/land-polygon/manage-polygon?id=${id}`)}
              style={{ padding: "9px 20px", background: "#064e3b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Gambar Polygon Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDelModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 32, maxWidth: 420, width: "100%", boxShadow: "0 24px 48px rgba(0,0,0,0.15)" }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#b91c1c" }}>
                <IconTrash />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>Hapus Lahan?</h3>
              <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>
                Anda akan menghapus lahan <strong>"{data?.land_name}"</strong> secara permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowDelModal(false)} disabled={delLoading}
                style={{ flex: 1, padding: "11px", border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#374151" }}>
                Batal
              </button>
              <button onClick={handleDelete} disabled={delLoading}
                style={{ flex: 1, padding: "11px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: delLoading ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 700 }}>
                {delLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}