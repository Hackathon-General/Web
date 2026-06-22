"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  CircleMarker,
} from "react-leaflet";
import L from "leaflet";
import { useLive } from "@/lib/hooks/useLive";
import { useTorch } from "@/lib/hooks/useTorch";
import { useUsers } from "@/lib/hooks/useUsers";
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

export default function LiveMapContent() {
  const pins = useLive();
  const { torch } = useTorch();
  const { users } = useUsers();
  const [selectedPin, setSelectedPin] = useState<LivePin | null>(null);

  const phones = pins.filter((p) => p.source === "phone").length;
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
          📱 {phones} מטיילים · 📡 {sensors} חיישנים
          {torch
            ? ` · 🔥 לפיד ${torch.status === "held" ? "נישא" : "ממתין"}`
            : ""}
        </p>
      </div>

      <div className="map-container" style={{ height: "calc(100vh - 200px)" }}>
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
          {stations.map((s) => {
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
            const userProfile = p.source === "phone" ? users.find((u) => u.uid === p.id) : null;
            return (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                radius={6}
                pathOptions={{
                  fillColor:
                    p.source === "sensor" ? colors.sky : colors.forest,
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
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      {userProfile?.photoURL && (
                        <img
                          src={userProfile.photoURL}
                          alt=""
                          referrerPolicy="no-referrer"
                          style={{
                            width: 24,
                            height: 24,
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
                          p.source === "sensor"
                            ? colors.sky
                            : colors.forest,
                        fontWeight: 700,
                      }}
                    >
                      {p.source === "sensor" ? "חיישן IoT" : "מטייל/ת"}
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
          {torch && (
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
