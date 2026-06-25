"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LandForm from "@/components/land/LandForm";

const IconLeft = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
    <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const INITIAL_FORM = {
  commodity_id: "",
  land_name: "",
  total_area_hectares: "",
  latitude: "-6.9175", // Default Bandung Raya
  longitude: "107.6191",
  zoom: 14, 
};

interface Commodity {
  id: string | number;
  name: string;
}

export default function CreateLandPage() {
  const router = useRouter();
  
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchCommodities();
  }, [router]);

  async function fetchCommodities() {
    const token = localStorage.getItem("access_token") || "";
    try {
      const res = await fetch("/api/proxy/commodity/index", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const resData = await res.json();
      if (resData.success && resData.data) {
        setCommodities(resData.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data komoditas", err);
    }
  }

  async function handleFormSubmit(submittedData: any) {
    setError(""); 
    setSuccess("");

    if (!submittedData.land_name.trim()) { setError("Nama Lahan wajib diisi."); return; }
    if (!submittedData.commodity_id) { setError("Silakan pilih Komoditas tanaman."); return; }
    if (!submittedData.total_area_hectares.trim()) { setError("Total Luas Area wajib diisi."); return; }

    const token = localStorage.getItem("access_token") || "";

    setLoading(true);
    try {
      const form = new URLSearchParams();
      Object.entries(submittedData).forEach(([k, v]) => {
        if (v) form.append(k, String(v));
      });

      const res = await fetch("/api/proxy/land/create", {
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

      setSuccess("Data lahan pertanian berhasil disimpan!");
      setTimeout(() => router.push("/lands"), 1200);
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan koneksi ke server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="button"
            onClick={() => router.push("/lands")}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 10, border: "1.5px solid #a7f3d0", background: "linear-gradient(135deg,#ecfdf5,#f0fdf4)", fontSize: 13, fontWeight: 600, color: "#065f46", cursor: "pointer", transition: "all 0.18s", boxShadow: "0 1px 4px rgba(16,185,129,0.1)" }}
            onMouseEnter={e => { Object.assign(e.currentTarget.style, { background: "linear-gradient(135deg,#d1fae5,#ecfdf5)", borderColor: "#6ee7b7", boxShadow: "0 3px 10px rgba(16,185,129,0.2)", transform: "translateX(-2px)" }); }}
            onMouseLeave={e => { Object.assign(e.currentTarget.style, { background: "linear-gradient(135deg,#ecfdf5,#f0fdf4)", borderColor: "#a7f3d0", boxShadow: "0 1px 4px rgba(16,185,129,0.1)", transform: "translateX(0)" }); }}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14" strokeLinecap="round" strokeLinejoin="round"><path d="M10 3L5 8l5 5"/></svg>
            Kembali
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0f172a" }}>Tambah Lahan Baru</h2>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: "#64748b" }}>Daftarkan wilayah pertanian baru dengan titik koordinat presisi</p>
          </div>
        </div>
      </div>

      {/* Panggil Komponen Form Utama */}
      <LandForm
        initialData={INITIAL_FORM}
        commodities={commodities}
        loading={loading}
        error={error}
        success={success}
        onCancel={() => router.push("/lands")}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}