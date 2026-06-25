"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// ─── Sidebar SVG Icons ────────────────────────────────────────────
const IcoDashboard   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg>;
const IcoLands       = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17l4-7 3 4 4-6 5 9H2z"/></svg>;
const IcoPolygon     = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2l7 5-3 8H6L3 7z"/></svg>;
const IcoCycles      = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" strokeLinecap="round"><path d="M3.5 10a6.5 6.5 0 1 1 2 4.7"/><path d="M3.5 14.5V10H8" strokeLinejoin="round"/></svg>;
const IcoActivities  = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="10" height="16" rx="1"/><path d="M8 6h4M8 9h4M8 12h3"/></svg>;
const IcoDocuments   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M4 3h8l4 4v11a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"/><path d="M12 3v4h4"/></svg>;
const IcoTracing     = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l4-5 4 4 3-3 3 5"/><path d="M3 14h14M3 17h10"/></svg>;
const IcoCert        = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M10 1.5L2.5 5v5c0 4.5 3.5 8 7.5 9 4-1 7.5-4.5 7.5-9V5L10 1.5z"/><path d="M7 10l2 2 4-4"/></svg>;
const IcoDiligence   = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>;
const IcoContact     = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13a2 2 0 01-2 2H6l-4 4V5a2 2 0 012-2h12a2 2 0 012 2z"/></svg>;
const IcoProfile     = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="6" r="3.5"/><path d="M2.5 18c0-4 3.1-7 7.5-7s7.5 3 7.5 7"/></svg>;
const IcoLogout      = () => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15" strokeLinecap="round" strokeLinejoin="round"><path d="M13 3h4v14h-4M9 14l4-4-4-4M13 10H4"/></svg>;
const IcoChevron     = ({ open }: { open: boolean }) => <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12" strokeLinecap="round" style={{ transition: "transform 0.2s", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}><path d="M5 8l5 5 5-5"/></svg>;
const IcoLeaf        = () => <svg viewBox="0 0 20 20" fill="none" stroke="#10b981" strokeWidth="1.8" width="22" height="22" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16c0-6 4-11 12-12-2 6-5 10-12 12z"/><path d="M4 16l4-4"/></svg>;

const menuGroups = [
  {
    id: "overview",
    title: "OVERVIEW",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: <IcoDashboard /> },
    ],
  },
  {
    id: "land_management",
    title: "LAND MANAGEMENT",
    items: [
      { name: "My Lands", path: "/lands", icon: <IcoLands /> },
      { name: "Polygon Mapping", path: "/land-polygon", icon: <IcoPolygon /> },
    ],
  },
  {
    id: "production_crop",
    title: "PRODUCTION & CROP",
    items: [
      { name: "Planting Cycles", path: "/planting-cycles", icon: <IcoCycles /> },
      { name: "Activity & Cost Logs", path: "/activities", icon: <IcoActivities /> },
    ],
  },
  {
    id: "global_compliance",
    title: "GLOBAL COMPLIANCE (EUDR)",
    items: [
      { name: "Land Documents", path: "/land-documents", icon: <IcoDocuments /> },
      { name: "Harvest Tracing", path: "/harvest-tracing", icon: <IcoTracing /> },
      { name: "Certifications", path: "/certifications", icon: <IcoCert /> },
      { name: "Due Diligence Reports", path: "/due-diligence", icon: <IcoDiligence /> },
    ],
  },
  {
    id: "support",
    title: "SUPPORT",
    items: [
      { name: "Hubungi Admin", path: "/contact", icon: <IcoContact /> },
    ],
  },
];

interface SidebarProps {
  sidebarOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ sidebarOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({ overview: true });

  useEffect(() => {
    menuGroups.forEach((group) => {
      const hasActive = group.items.some(i => pathname === i.path || pathname.startsWith(`${i.path}/`));
      if (hasActive) setOpenGroups(prev => ({ ...prev, [group.id]: true }));
    });
  }, [pathname]);

  const toggleGroup = (id: string) => setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

  const handleLogout = () => { localStorage.clear(); router.push("/login"); };
  const handleNav    = (path: string) => { router.push(path); if (onClose) onClose(); };

  return (
    <>
      <aside className={`agr-sidebar${sidebarOpen ? " open" : ""}`}>
        {/* Brand */}
        <div style={{ padding: "22px 18px", borderBottom: "1px solid rgba(16,185,129,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(16,185,129,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IcoLeaf />
          </div>
          <div>
            <div style={{ color: "#ecfdf5", fontWeight: 700, fontSize: 15, letterSpacing: "0.5px" }}>AGRANTARA</div>
            <div style={{ fontSize: 10, color: "#6ee7b7", fontWeight: 500 }}>Farmer Compliance</div>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 10px" }}>
          {menuGroups.map((group) => {
            const isOpen = !!openGroups[group.id];
            return (
              <div key={group.id} style={{ marginBottom: 10 }}>
                <button onClick={() => toggleGroup(group.id)}
                  style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", fontSize: 10, fontWeight: 700, color: isOpen ? "#34d399" : "#6ee7b7", padding: "6px 12px", letterSpacing: "1px", cursor: "pointer", textAlign: "left" }}>
                  <span>{group.title}</span>
                  <IcoChevron open={isOpen} />
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 2, maxHeight: isOpen ? "500px" : "0px", overflow: "hidden", transition: "max-height 0.25s ease-in-out" }}>
                  {group.items.map((item, idx) => {
                    const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                    return (
                      <button key={idx} className="agr-nav-btn" onClick={() => handleNav(item.path)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px 9px 18px", borderRadius: 8, border: "none", background: isActive ? "rgba(16,185,129,0.25)" : "transparent", color: isActive ? "#ecfdf5" : "#a7f3d0", textAlign: "left", fontSize: 13, fontWeight: isActive ? 600 : 400, cursor: "pointer", width: "100%", transition: "background 0.15s, color 0.15s" }}>
                        <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.name}</span>
                        {isActive && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Logout */}
        <div style={{ padding: "14px 10px", borderTop: "1px solid rgba(16,185,129,0.2)" }}>
          <button onClick={handleLogout}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px", background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", color: "#fca5a5", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
            <IcoLogout /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
