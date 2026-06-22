"use client";

import { useState, Fragment } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  CircleMarker,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import { useLive } from "@/lib/hooks/useLive";
import { useTorch } from "@/lib/hooks/useTorch";
import { useUsers } from "@/lib/hooks/useUsers";
import { useMissions } from "@/lib/hooks/useMissions";
import { useAlerts } from "@/lib/hooks/useAlerts";
import {
  stations,
  routes,
  valueTheme,
  colors,
} from "@/lib/content";
import type { LivePin } from "@/lib/hooks/useLive";

const INITIAL_CENTER: [number, number] = [32.72, 35.27];
const INITIAL_ZOOM = 10;

function createIcon(color: string, size: number = 10) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createStationIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const torchIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">🔥</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function createMissionIcon(active: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${active ? colors.terracotta : "#999"};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

const alertIcon = L.divIcon({
  className: "",
  html: `<div style="width:14px;height:14px;border-radius:50%;background:${colors.danger};border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function LiveMapContent() {
  const pins = useLive();
  const { torch } = useTorch();
  const { users } = useUsers();
  const { missions } = useMissions();
  const { alerts } = useAlerts();
  const [selectedPin, setSelectedPin] = useState<LivePin | null>(null);

  const [showHikers, setShowHikers] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showTorch, setShowTorch] = useState(true);
  const [showMissions, setShowMissions] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);

  const phones = pins.filter((p) => p.source !== "sensor").length;
  const sensors = pins.filter((p) => p.source === "sensor").length;

  const routeCoords: [number, number][] = routes.waypoints.map((w) => [
    w.lat,
    w.lng,
  ]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🗺️ מפה חיה — God Mode</h1>
        <p className="page-subtitle">
          📱 {phones} מטיילים · 📡 {sensors} חיישנים · 📋 {missions.filter(m => m.active).length} משימות · 🚨 {alerts.length} התראות
          {torch
            ? ` · 🔥 לפיד ${torch.status === "held" ? "נישא" : "ממתין"}`
            : ""}
        </p>
      </div>

      <div className="map-container" style={{ height: "calc(100vh - 200px)", position: "relative" }}>
        {/* Filter overlay */}
        <div style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 1000,
          background: "rgba(26, 26, 26, 0.9)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          padding: "12px",
          borderRadius: "8px",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          minWidth: "130px",
          direction: "rtl",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}>
          <div style={{ fontWeight: 800, fontSize: "0.8125rem", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 6, marginBottom: 4 }}>
            🗺️ סינון מפה
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={showHikers} onChange={(e) => setShowHikers(e.target.checked)} />
            מטיילים (📱)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={showSensors} onChange={(e) => setShowSensors(e.target.checked)} />
            חיישנים (📡)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={showStations} onChange={(e) => setShowStations(e.target.checked)} />
            תחנות (📍)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={showMissions} onChange={(e) => setShowMissions(e.target.checked)} />
            משימות (📋)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={showAlerts} onChange={(e) => setShowAlerts(e.target.checked)} />
            התראות (🚨)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={showTorch} onChange={(e) => setShowTorch(e.target.checked)} />
            לפיד (🔥)
          </label>
        </div>

        <MapContainer
          center={INITIAL_CENTER}
          zoom={INITIAL_ZOOM}
          style={{ width: "100%", height: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Route polyline */}
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: colors.terracotta,
              weight: 4,
              opacity: 0.8,
            }}
          />

          {/* Station markers */}
          {showStations && stations.map((s) => {
            const v = valueTheme[s.value];
            return (
              <Marker
                key={s.id}
                position={[s.lat, s.lng]}
                icon={createStationIcon(v?.color ?? colors.forest)}
              >
                <Popup>
                  <div style={{ textAlign: "right", minWidth: 180 }}>
                    <strong style={{ fontSize: "0.9375rem" }}>
                      {s.number}. {s.name}
                    </strong>
                    <div
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 999,
                        background: v?.color ?? "#666",
                        color: "#fff",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        marginRight: 6,
                      }}
                    >
                      {v?.label}
                    </div>
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: "0.8125rem",
                        color: "#555",
                      }}
                    >
                      {s.aboutPlace}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Live pins */}
          {pins.map((p) => {
            const isSensor = p.source === "sensor";
            if (isSensor && !showSensors) return null;
            if (!isSensor && !showHikers) return null;

            const userProfile = !isSensor ? users.find((u) => u.uid === p.id) : null;
            return (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                radius={6}
                pathOptions={{
                  fillColor:
                    isSensor ? colors.sky : colors.forest,
                  fillOpacity: 0.9,
                  color: "#fff",
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => setSelectedPin(p),
                }}
              >
                <Popup>
                  <div style={{ textAlign: "right", minWidth: 150 }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        direction: "ltr",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      {userProfile?.photoURL && (
                        <img
                          src={userProfile.photoURL}
                          alt=""
                          referrerPolicy="no-referrer"
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <strong>{p.name ?? p.id}</strong>
                    </div>
                    <span
                      style={{
                        color:
                          isSensor
                            ? colors.sky
                            : colors.forest,
                        fontWeight: 700,
                      }}
                    >
                      {isSensor ? "חיישן IoT" : "מטייל/ת"}
                    </span>
                    {p.speed != null && (
                      <>
                        <br />
                        מהירות: {p.speed.toFixed(1)} מ׳/ש
                      </>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Torch marker */}
          {showTorch && torch && (
            <Marker position={[torch.lat, torch.lng]} icon={torchIcon}>
              <Popup>
                <div style={{ textAlign: "right" }}>
                  <strong>🔥 לפיד</strong>
                  <br />
                  {torch.holderName ?? "ממתין בשביל"}
                </div>
              </Popup>
            </Marker>
          )}

          {/* Mission markers */}
          {showMissions && missions.map((nfr) => (
            <Fragment key={nfr.id}>
              <Marker
                position={[nfr.lat, nfr.lng]}
                icon={createMissionIcon(nfr.active)}
              >
                <Popup>
                  <div style={{ textAlign: "right", direction: "rtl", minWidth: 150 }}>
                    <strong style={{ fontSize: "0.9375rem", display: "block" }}>📋 {nfr.title}</strong>
                    {nfr.task && <p style={{ margin: "4px 0", fontSize: "0.8125rem", color: "#555" }}>{nfr.task}</p>}
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: nfr.active ? colors.terracotta : "#999" }}>
                      {nfr.active ? "● משימה פעילה" : "○ משימה כבויה"}
                    </span>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[nfr.lat, nfr.lng]}
                radius={nfr.radius}
                pathOptions={{
                  color: nfr.active ? colors.terracotta : "#999",
                  fillColor: nfr.active ? colors.terracotta : "#999",
                  fillOpacity: nfr.active ? 0.15 : 0.05,
                  dashArray: nfr.active ? undefined : "4 4",
                }}
              />
            </Fragment>
          ))}

          {/* Alert markers */}
          {showAlerts && alerts.map((a) => (
            <Fragment key={a.id}>
              <Marker
                position={[a.lat, a.lng]}
                icon={alertIcon}
              >
                <Popup>
                  <div style={{ textAlign: "right", direction: "rtl", minWidth: 150 }}>
                    <strong style={{ fontSize: "0.9375rem", display: "block" }}>🚨 {a.title}</strong>
                    <p style={{ margin: "4px 0", fontSize: "0.8125rem", color: "#555" }}>{a.message}</p>
                    <span style={{ fontSize: "0.6875rem", color: "#888" }}>
                      {new Date(a.createdAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[a.lat, a.lng]}
                radius={a.radius}
                pathOptions={{
                  color: colors.danger,
                  fillColor: colors.danger,
                  fillOpacity: 0.08,
                  dashArray: "3 3",
                }}
              />
            </Fragment>
          ))}
        </MapContainer>
      </div>

      {/* Legend */}
      <div
        className="card"
        style={{
          marginTop: "var(--sp-md)",
          display: "flex",
          gap: "var(--sp-lg)",
          flexWrap: "wrap",
          padding: "var(--sp-md) var(--sp-lg)",
          fontSize: "0.8125rem",
        }}
      >
        <span>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: colors.forest,
              marginLeft: 4,
            }}
          />{" "}
          מטיילים
        </span>
        <span>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: colors.sky,
              marginLeft: 4,
            }}
          />{" "}
          חיישנים
        </span>
        <span>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: colors.terracotta,
              marginLeft: 4,
            }}
          />{" "}
          משימות NFR
        </span>
        <span>
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: colors.danger,
              marginLeft: 4,
            }}
          />{" "}
          התראות GPS
        </span>
        <span>🔥 לפיד</span>
        <span>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 4,
              background: colors.terracotta,
              marginLeft: 4,
              borderRadius: 2,
            }}
          />{" "}
          מסלול השביל
        </span>
      </div>
    </div>
  );
}
