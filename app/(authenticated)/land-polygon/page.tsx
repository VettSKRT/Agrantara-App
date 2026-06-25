"use client";

import { useRouter } from "next/navigation";
import LandBaseTable from "@/components/land/LandBaseTable";

// ─── SVG Icons ────────────────────────────────────────────────────
const IcoEdit   = () => <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1.5a2 2 0 012.8 2.8L5 14 1.5 15l1-3.5L12 1.5z"/></svg>;
const IcoPlus   = () => <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" strokeLinecap="round"><path d="M9 3v12M3 9h12"/></svg>;
const IcoShield = () => <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1.5L1.5 5v4.5c0 4 3 7.5 7.5 8 4.5-.5 7.5-4 7.5-8V5L9 1.5z"/></svg>;
const IcoEye    = () => <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" width="13" height="13" strokeLinecap="round"><path d="M1 9s2.8-5.5 8-5.5S17 9 17 9s-2.8 5.5-8 5.5S1 9 1 9z"/><circle cx="9" cy="9" r="2.5"/></svg>;
const IcoCheck  = () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" width="11" height="11" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l4 4 6-6"/></svg>;
const IcoX      = () => <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" width="11" height="11" strokeLinecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>;

export default function LandPolygonPage() {
  const router = useRouter();

  const renderPolygonActions = (item: any) => {
    const hasPolygon = item.has_polygon === 1 || item.has_polygon === true ||
      (item.polygon_path && item.polygon_path !== "[]") ||
      (typeof window !== "undefined" && !!localStorage.getItem(`polygon_land_${item.id}`));

    return (
      <div style={{ display: "flex", gap: 6, width: "100%", flexWrap: "wrap" }}>
        <button onClick={() => router.push(`/land-polygon/manage-polygon?id=${item.id}`)}
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "6px 10px", borderRadius: 6, border: hasPolygon ? "1px solid #ddd6fe" : "1px solid #bbf7d0", background: hasPolygon ? "#f5f3ff" : "#f0fdf4", color: hasPolygon ? "#7c3aed" : "#16a34a", fontSize: 12, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
          {hasPolygon ? <><IcoEdit /> Edit Polygon</> : <><IcoPlus /> Add Polygon</>}
        </button>

        <button onClick={() => router.push(`/land-polygon/eudr-compliance?id=${item.id}`)}
          title="Periksa Kepatuhan Regulasi EUDR"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "6px 10px", borderRadius: 6, border: "1px solid #fed7aa", background: "#fff7ed", color: "#ea580c", fontSize: 12, cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
          <IcoShield /> Check EUDR
        </button>

        <button onClick={() => router.push(`/land-polygon/view-polygon?id=${item.id}`)}
          title="Lihat detail batas polygon"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#fff", color: "#334155", fontSize: 12, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap" }}>
          <IcoEye /> Detail
        </button>
      </div>
    );
  };

  const renderPolygonHeader = () => (
    <>
      <th style={{ padding: "13px 14px", textAlign: "left", color: "#a7f3d0", textTransform: "uppercase", fontSize: 11, fontWeight: 700 }}>
        Status Spasial
      </th>
      <th style={{ padding: "13px 14px", textAlign: "left", color: "#a7f3d0", textTransform: "uppercase", fontSize: 11, fontWeight: 700 }}>
        EUDR Compliance
      </th>
    </>
  );

  const renderPolygonCardStats = (item: any) => {
    const hasPolygon = item.has_polygon === 1 || item.has_polygon === true ||
      (item.polygon_path && item.polygon_path !== "[]") ||
      (typeof window !== "undefined" && !!localStorage.getItem(`polygon_land_${item.id}`));
    const eudrStatus = item.eudr_status || (hasPolygon ? "Verified" : "Non-Compliant");
    const isVerified = eudrStatus === "Verified";
    return (
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 10, background: hasPolygon ? "#e0f2fe" : "#fef2f2", color: hasPolygon ? "#0369a1" : "#991b1b", display: "inline-flex", alignItems: "center", gap: 4 }}>
          {hasPolygon ? <IcoCheck /> : <IcoX />}
          {hasPolygon ? "Terpetakan" : "Belum Ada"}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 10, background: isVerified ? "#dcfce7" : "#fff7ed", color: isVerified ? "#15803d" : "#c2410c", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <IcoShield />
          {isVerified ? "EUDR OK" : "Non-Compliant"}
        </span>
      </div>
    );
  };

  const renderPolygonRow = (item: any) => {
    const hasPolygon = item.has_polygon === 1 || item.has_polygon === true ||
      (item.polygon_path && item.polygon_path !== "[]") ||
      (typeof window !== "undefined" && !!localStorage.getItem(`polygon_land_${item.id}`));
    const eudrStatus = item.eudr_status || (hasPolygon ? "Verified" : "Non-Compliant");
    const isVerified = eudrStatus === "Verified";

    return (
      <>
        <td style={{ padding: "12px 14px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 12, background: hasPolygon ? "#e0f2fe" : "#fef2f2", color: hasPolygon ? "#0369a1" : "#991b1b", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
            {hasPolygon ? <IcoCheck /> : <IcoX />}
            {hasPolygon ? "Terpetakan" : "Belum Ada"}
          </span>
        </td>
        <td style={{ padding: "12px 14px" }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 12, background: isVerified ? "#dcfce7" : "#fff7ed", color: isVerified ? "#15803d" : "#c2410c", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
            <IcoShield />
            {isVerified ? "Verified" : "Non-Compliant"}
          </span>
        </td>
      </>
    );
  };

  return (
    <LandBaseTable
      title="Pemetaan Geometris & EUDR Lahan"
      subtitle="Manajemen spasial batas poligon lahan pertanian satelit untuk kepatuhan regulasi EUDR"
      icon={<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4l6-2 6 2 6-2v14l-6 2-6-2-6 2V4z"/><path d="M7 2v14M13 4v14"/></svg>}
      apiUrl="/api/proxy/land/index"
      renderActions={renderPolygonActions}
      renderExtraColumnsHeader={renderPolygonHeader}
      renderExtraColumnsRow={renderPolygonRow}
      renderExtraCardStats={renderPolygonCardStats}
    />
  );
}
