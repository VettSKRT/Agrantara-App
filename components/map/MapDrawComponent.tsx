"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MapContainer, TileLayer, FeatureGroup, Marker, Popup, Polygon, useMap } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

function MapFitter({ coords, center, zoom }: { coords: any[] | null; center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords.length >= 3) {
      try {
        const latlngs = coords.map((c: any) => Array.isArray(c) ? [c[0], c[1]] : [c.lat, c.lng]);
        const bounds = L.latLngBounds(latlngs as [number, number][]);
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40] });
      } catch {}
    } else if (zoom > 5) {
      map.setView(center, zoom);
    }
  }, [coords, center, zoom, map]);
  return null;
}

type LayerKey = "leaflet" | "satellite" | "deforestation";

const LayerIco = {
  leaflet:       <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3l5-1.5 4 1.5 5-1.5v11l-5 1.5-4-1.5-5 1.5V3z"/></svg>,
  satellite:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="8" r="6"/><path d="M8 2a9 9 0 010 12M2 8h12"/></svg>,
  deforestation: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" width="13" height="13" strokeLinecap="round" strokeLinejoin="round"><path d="M2 14c0-4 2.5-7 6-8-1 3.5-2.5 6-6 8z"/><path d="M2 14l3-3M10 14c0-3 1.5-5.5 5-6-1 2.5-2.5 4-5 6z"/></svg>,
};

const LAYERS: Record<LayerKey, { url: string; attribution: string; label: string; icon: React.ReactNode; maxZoom?: number }> = {
  leaflet: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    label: "Peta Standar",
    icon: LayerIco.leaflet,
  },
  satellite: {
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attribution: "&copy; Google Maps",
    label: "Citra Satelit",
    icon: LayerIco.satellite,
    maxZoom: 20,
  },
  deforestation: {
    url: "https://tiles.globalforestwatch.org/umd_tree_cover_loss/latest/default/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://globalforestwatch.org">Global Forest Watch</a>',
    label: "Deforestation Map",
    icon: LayerIco.deforestation,
    maxZoom: 12,
  },
};

interface MapDrawComponentProps {
  landId: string | null;
  token: string;
  readOnly?: boolean;
}

export default function MapDrawComponent({ landId, token, readOnly = false }: MapDrawComponentProps) {
  const [landData, setLandData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [polygonCoords, setPolygonCoords] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-2.5489, 118.0149]);
  const [zoom, setZoom] = useState(5);
  const [activeLayer, setActiveLayer] = useState<LayerKey>("satellite");
  const [saving, setSaving] = useState(false);

  const featureGroupRef = useRef<any>(null);

  useEffect(() => {
    async function fetchLand() {
      if (!landId) return;
      try {
        const res = await fetch(`/api/proxy/land/view/${landId}`, {
          headers: {
            Authorization: token.startsWith("Bearer") ? token : `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const result = await res.json();
        const d = result.data ?? result.item ?? result.land ?? result;
        if (d && typeof d === "object") {
          setLandData(d);
          if (d.latitude && d.longitude) {
            setMapCenter([parseFloat(d.latitude), parseFloat(d.longitude)]);
            setZoom(16);
          }
          const rawPath = d.polygon_path ?? d.polygonPath ?? d.polygon ?? null;
          let coordsLoaded = false;
          if (rawPath) {
            try {
              const coords = typeof rawPath === "string" ? JSON.parse(rawPath) : rawPath;
              if (Array.isArray(coords) && coords.length > 0) {
                setPolygonCoords(coords);
                coordsLoaded = true;
              }
            } catch {}
          }
          if (!coordsLoaded) {
            const stored = localStorage.getItem(`polygon_land_${landId}`);
            if (stored) {
              try {
                const coords = JSON.parse(stored);
                if (Array.isArray(coords) && coords.length > 0) setPolygonCoords(coords);
              } catch {}
            }
          }
        }
      } catch (err) {
        console.error("Fetch lahan error:", err);
        const stored = localStorage.getItem(`polygon_land_${landId}`);
        if (stored) {
          try {
            const coords = JSON.parse(stored);
            if (Array.isArray(coords) && coords.length > 0) setPolygonCoords(coords);
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    }
    fetchLand();
  }, [landId, token]);

  const _onCreated = (e: any) => {
    const latLngs = e.layer.getLatLngs()[0];
    setPolygonCoords(latLngs.map((p: any) => [p.lat, p.lng]));
  };

  const _onEdited = (e: any) => {
    e.layers.eachLayer((layer: any) => {
      setPolygonCoords(layer.getLatLngs()[0].map((p: any) => [p.lat, p.lng]));
    });
  };

  const _onDeleted = () => {
    setPolygonCoords(null);
    if (landId) localStorage.removeItem(`polygon_land_${landId}`);
  };

  const handleSave = async () => {
    if (!polygonCoords || polygonCoords.length === 0) {
      toast.warning("Silakan gambar polygon terlebih dahulu!");
      return;
    }
    setSaving(true);
    try {
      const body = new URLSearchParams();
      body.append("polygon_path", JSON.stringify(polygonCoords));
      const res = await fetch(`/api/proxy/land/update-polygon/${landId}`, {
        method: "POST",
        headers: {
          Authorization: token.startsWith("Bearer") ? token : `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result.status === true || result.success === true) {
        localStorage.setItem(`polygon_land_${landId}`, JSON.stringify(polygonCoords));
        toast.success("Polygon lahan berhasil disimpan!");
      } else {
        toast.error("Gagal menyimpan: " + (result.msg || result.message || "Kesalahan backend"));
      }
    } catch (err) {
      toast.error("Terjadi kesalahan: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <p style={{ padding: 24, textTransform: "uppercase", fontSize: 13, color: "#64748b", textAlign: "center" }}>
      Memuat data peta lahan...
    </p>
  );

  const layerConfig = LAYERS[activeLayer];

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css" />

      {/* Header info */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#1e293b" }}>
            {readOnly ? "Detail Polygon Lahan" : "Kelola Polygon Lahan"}:{" "}
            <span style={{ color: "#10b981" }}>{landData?.land_name || "Lahan"}</span>
          </h2>
          {readOnly && (
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>Mode tampilan — tidak dapat mengedit polygon</p>
          )}
        </div>
        {polygonCoords && polygonCoords.length > 0 && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#16a34a", fontWeight: 600 }}>
            Polygon aktif — {polygonCoords.length} titik koordinat
          </div>
        )}
      </div>

      {/* Layer Switcher */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, alignSelf: "center" }}>Pilih Layer:</span>
        {(Object.keys(LAYERS) as LayerKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveLayer(key)}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              border: activeLayer === key ? "2px solid #10b981" : "1px solid #e2e8f0",
              background: activeLayer === key ? "#f0fdf4" : "#fff",
              color: activeLayer === key ? "#065f46" : "#374151",
              fontSize: 13,
              fontWeight: activeLayer === key ? 700 : 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s",
            }}
          >
            {LAYERS[key].icon} {LAYERS[key].label}
          </button>
        ))}
      </div>

      {/* Deforestation layer note */}
      {activeLayer === "deforestation" && (
        <div style={{ padding: "10px 14px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, fontSize: 12, color: "#c2410c" }}>
          <strong>Deforestation Map</strong> — Data dari Global Forest Watch (GFW). Area merah menunjukkan kehilangan tutupan hutan sejak 2000. Area biru menunjukkan tutupan hutan.
          Lahan dengan polygon pada area merah berisiko <strong>Non-Compliant EUDR</strong>.
        </div>
      )}

      {/* Map */}
      <div style={{ height: 500, width: "100%", borderRadius: 10, overflow: "hidden", border: "1px solid #cbd5e1", position: "relative" }}>
        <MapContainer center={mapCenter} zoom={zoom} style={{ height: "100%", width: "100%" }}>
          <MapFitter coords={polygonCoords} center={mapCenter} zoom={zoom} />
          <TileLayer
            key={activeLayer}
            url={layerConfig.url}
            attribution={layerConfig.attribution}
            maxZoom={layerConfig.maxZoom || 19}
          />

          {/* Overlay deforestation on satellite for context */}
          {activeLayer === "deforestation" && (
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              attribution=""
              opacity={0.4}
            />
          )}

          {/* Center marker */}
          {landData?.latitude && landData?.longitude && (
            <Marker position={[parseFloat(landData.latitude), parseFloat(landData.longitude)]}>
              <Popup>
                <strong>{landData.land_name}</strong><br />
                {landData.commodity_name || ""}<br />
                {landData.total_area_hectares} Ha
              </Popup>
            </Marker>
          )}

          {readOnly ? (
            /* View-only: render polygon tanpa kontrol edit */
            <>
              {polygonCoords && (
                <Polygon positions={polygonCoords} color="#10b981" weight={3} fillOpacity={0.25} />
              )}
            </>
          ) : (
            /* Edit mode */
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topleft"
                onCreated={_onCreated}
                onEdited={_onEdited}
                onDeleted={_onDeleted}
                draw={{
                  rectangle: false, circle: false, circlemarker: false,
                  marker: false, polyline: false,
                  polygon: {
                    allowIntersection: false,
                    shapeOptions: { color: "#10b981", fillOpacity: 0.25, weight: 3 },
                  },
                }}
              />
              {polygonCoords && <Polygon positions={polygonCoords} color="#3b82f6" weight={3} fillOpacity={0.2} />}
            </FeatureGroup>
          )}
        </MapContainer>
      </div>

      {/* Action buttons */}
      {!readOnly && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={handleSave}
            disabled={saving || !polygonCoords}
            style={{
              padding: "10px 22px", background: saving || !polygonCoords ? "#6b7280" : "#16a34a",
              color: "#fff", border: "none", borderRadius: 8, cursor: saving || !polygonCoords ? "not-allowed" : "pointer",
              fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {saving ? "Menyimpan..." : "Simpan Polygon"}
          </button>
          {polygonCoords && (
            <button
              onClick={() => setPolygonCoords(null)}
              style={{ padding: "10px 18px", background: "#fff", border: "1px solid #e2e8f0", color: "#374151", borderRadius: 8, cursor: "pointer", fontSize: 14 }}
            >
              Reset Polygon
            </button>
          )}
        </div>
      )}

      {/* Coordinate info */}
      {polygonCoords && polygonCoords.length > 0 && (
        <div style={{ background: "#0f172a", borderRadius: 8, padding: "12px 16px", fontSize: 11, fontFamily: "monospace", color: "#38bdf8", overflowX: "auto" }}>
          <div style={{ color: "#64748b", marginBottom: 6, fontFamily: "inherit", fontSize: 11 }}>KOORDINAT POLYGON (GeoJSON):</div>
          {`{ "type":"Polygon", "coordinates": [[ `}
          {polygonCoords.slice(0, 3).map((c: any, i: number) => `[${Array.isArray(c) ? c.join(", ") : `${c.lat}, ${c.lng}`}]${i < 2 ? ", " : "..."}`)}
          {` ]] }`}
        </div>
      )}
    </div>
  );
}
