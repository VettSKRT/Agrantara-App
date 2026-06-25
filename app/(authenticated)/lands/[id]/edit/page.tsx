"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LandForm from "@/components/land/LandForm";

const IconLeft = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
    <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface Commodity {
  id: string | number;
  name: string;
}

const INITIAL_FORM = {
  commodity_id: "",
  land_name: "",
  total_area_hectares: "",
  latitude: "-6.9175",
  longitude: "107.6191",
  zoom: 14,
};

export default function EditLandPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [formData, setFormData] = useState<any>(null);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Mengambil data lahan yang akan diedit dan master data komoditas secara bersamaan
    Promise.all([
      fetch(`/api/proxy/land/view/${id}`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/proxy/commodity/index", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()).catch(() => ({ data: [] }))
    ])
      .then(([landRes, commodityRes]) => {
        if (landRes.status && landRes.data) {
          // Atur data yang didapat dari Yii2 ke dalam state form
          setFormData({
            commodity_id: landRes.data.commodity_id || "",
            land_name: landRes.data.land_name || "",
            total_area_hectares: landRes.data.total_area_hectares || "",
            latitude: landRes.data.latitude || "-6.9175",
            longitude: landRes.data.longitude || "107.6191",
            zoom: 14,
          });
        } else {
          setError(landRes.msg || "Gagal mengambil data lahan");
        }

        if (commodityRes.success && commodityRes.data) {
          setCommodities(commodityRes.data);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Terjadi kesalahan jaringan saat mengambil data");
      })
      .finally(() => setPageLoading(false));
  }, [id, router]);

  async function handleFormSubmit(updatedData: any) {
    setError("");
    setSuccess("");

    if (!updatedData.land_name.trim()) { setError("Nama Lahan wajib diisi."); return; }
    if (!updatedData.commodity_id) { setError("Silakan pilih Komoditas tanaman."); return; }
    if (!updatedData.total_area_hectares.toString().trim()) { setError("Total Luas Area wajib diisi."); return; }

    const token = localStorage.getItem("access_token") || "";

    setLoading(true);
    try {
      const form = new URLSearchParams();
      Object.entries(updatedData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) form.append(k, String(v));
      });

      const res = await fetch(`/api/proxy/land/update/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
        body: form.toString(),
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok || resData.status === false) {
        setError(resData.msg || resData.message || `HTTP ${res.status}`);
        return;
      }

      setSuccess("Perubahan data lahan berhasil diperbarui!");
      setTimeout(() => router.push(`/lands/${id}`), 1200);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan koneksi ke server");
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div style={{ display: "flex", height: "50vh", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#64748b" }}>
        Memuat data lahan yang akan diubah...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={() => router.push(`/lands/${id}`)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, border: "1.5px solid #a7f3d0", background: "linear-gradient(135deg,#ecfdf5,#f0fdf4)", fontSize: 13, fontWeight: 600, color: "#065f46", cursor: "pointer", transition: "all 0.18s", boxShadow: "0 1px 4px rgba(16,185,129,0.1)" }}
            onMouseEnter={e => { Object.assign(e.currentTarget.style, { background: "linear-gradient(135deg,#d1fae5,#ecfdf5)", borderColor: "#6ee7b7", boxShadow: "0 3px 10px rgba(16,185,129,0.2)", transform: "translateX(-2px)" }); }}
            onMouseLeave={e => { Object.assign(e.currentTarget.style, { background: "linear-gradient(135deg,#ecfdf5,#f0fdf4)", borderColor: "#a7f3d0", boxShadow: "0 1px 4px rgba(16,185,129,0.1)", transform: "translateX(0)" }); }}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
            Kembali ke Detail
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Ubah Data Lahan</h2>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b" }}>Perbarui koordinat pemetaan spasial dan data komoditas pertanian</p>
          </div>
        </div>
      </div>

      {/* Memasang Form Component Bersama */}
      {formData && (
        <LandForm
          initialData={formData}
          commodities={commodities}
          loading={loading}
          error={error}
          success={success}
          onCancel={() => router.push(`/lands/${id}`)}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}