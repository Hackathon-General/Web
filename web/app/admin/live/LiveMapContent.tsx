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
import { useFeed } from "@/lib/hooks/useFeed";
import {
  LuMap,
  LuSmartphone,
  LuRadio,
  LuMapPin,
  LuClipboardList,
  LuSiren,
  LuFlame,
  LuNewspaper,
  LuUser,
} from "react-icons/lu";
import {
  stations,
  routes,
  valueTheme,
  colors,
} from "@/lib/content";
import type { LivePin } from "@/lib/hooks/useLive";

const INITIAL_CENTER: [number, number] = [32.72, 35.27];
const INITIAL_ZOOM = 10;

const phoneSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>`;
const sensorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"/></svg>`;
const stationSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
const missionSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>`;
const alertSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/><path d="M21 12h1"/><path d="M18.5 6.5 19 6"/><path d="M12 2h1"/><path d="M5.5 6.5 5 6"/><path d="M2 12h1"/></svg>`;
const torchSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
const newspaperSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>`;

function getJitteredCoords(lat: number, lng: number, seed: string): [number, number] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const offsetLat = ((Math.abs(hash) % 1000) / 1000 - 0.5) * 0.0016;
  const offsetLng = ((Math.abs(hash >> 8) % 1000) / 1000 - 0.5) * 0.0016;
  return [lat + offsetLat, lng + offsetLng];
}

function formatPostDate(ts?: any) {
  if (!ts) return "—";
  if (typeof ts.toDate === "function") {
    return ts.toDate().toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }
  if (ts.seconds !== undefined) {
    return new Date(ts.seconds * 1000).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }
  return new Date(ts).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function createMapIcon(svgMarkup: string, backgroundColor: string, size: number = 24) {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${backgroundColor};
        border: 2px solid #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      ">
        ${svgMarkup}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createStationIcon(color: string) {
  return createMapIcon(stationSvg, color, 24);
}

const torchIcon = createMapIcon(torchSvg, "var(--c-gold)", 28);

function createMissionIcon(active: boolean) {
  return createMapIcon(missionSvg, active ? colors.terracotta : "#999", 24);
}

const alertIcon = createMapIcon(alertSvg, colors.danger, 24);
const newspaperIcon = createMapIcon(newspaperSvg, "#9333ea", 24);

export default function LiveMapContent() {
  const pins = useLive();
  const { torch } = useTorch();
  const { users } = useUsers();
  const { missions } = useMissions();
  const { alerts } = useAlerts();
  const { posts } = useFeed(200);
  const [selectedPin, setSelectedPin] = useState<LivePin | null>(null);

  const [showHikers, setShowHikers] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showStations, setShowStations] = useState(true);
  const [showTorch, setShowTorch] = useState(true);
  const [showMissions, setShowMissions] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showPosts, setShowPosts] = useState(true);

  const phones = pins.filter((p) => p.source !== "sensor").length;
  const sensors = pins.filter((p) => p.source === "sensor").length;

  const routeCoords: [number, number][] = routes.waypoints.map((w) => [
    w.lat,
    w.lng,
  ]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LuMap /> מפה חיה — God Mode
        </h1>
        <p className="page-subtitle" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><LuSmartphone size={16} /> {phones} מטיילים</span>
          <span>·</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><LuRadio size={16} /> {sensors} חיישנים</span>
          <span>·</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><LuClipboardList size={16} /> {missions.filter(m => m.active).length} משימות</span>
          <span>·</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><LuSiren size={16} /> {alerts.length} התראות</span>
          <span>·</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><LuNewspaper size={16} /> {posts.length} פוסטים</span>
          {torch && (
            <>
              <span>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <LuFlame size={16} style={{ color: "var(--c-gold)" }} /> לפיד {torch.status === "held" ? "נישא" : "ממתין"}
              </span>
            </>
          )}
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
          <div style={{ fontWeight: 800, fontSize: "0.8125rem", borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 6, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
            <LuMap size={14} /> סינון מפה
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={showHikers} onChange={(e) => setShowHikers(e.target.checked)} />
            <LuSmartphone size={14} /> מטיילים
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={showSensors} onChange={(e) => setShowSensors(e.target.checked)} />
            <LuRadio size={14} /> חיישנים
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={showStations} onChange={(e) => setShowStations(e.target.checked)} />
            <LuMapPin size={14} /> תחנות
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={showMissions} onChange={(e) => setShowMissions(e.target.checked)} />
            <LuClipboardList size={14} /> משימות
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={showAlerts} onChange={(e) => setShowAlerts(e.target.checked)} />
            <LuSiren size={14} /> התראות
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={showTorch} onChange={(e) => setShowTorch(e.target.checked)} />
            <LuFlame size={14} /> לפיד
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", cursor: "pointer", userSelect: "none" }}>
            <input type="checkbox" checked={showPosts} onChange={(e) => setShowPosts(e.target.checked)} />
            <LuNewspaper size={14} /> פוסטים
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
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                icon={createMapIcon(
                  isSensor ? sensorSvg : phoneSvg,
                  isSensor ? colors.sky : colors.forest,
                  24
                )}
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
              </Marker>
            );
          })}

          {/* Torch marker */}
          {showTorch && torch && (
            <Marker position={[torch.lat, torch.lng]} icon={torchIcon}>
              <Popup>
                <div style={{ textAlign: "right", direction: "rtl" }}>
                  <strong style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.9375rem" }}>
                    <LuFlame style={{ color: "var(--c-gold)" }} /> לפיד
                  </strong>
                  <span style={{ fontSize: "0.8125rem", color: "#555" }}>
                    {torch.holderName ?? "ממתין בשביל"}
                  </span>
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
                    <strong style={{ fontSize: "0.9375rem", display: "flex", alignItems: "center", gap: 6 }}>
                      <LuClipboardList size={16} /> {nfr.title}
                    </strong>
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
                    <strong style={{ fontSize: "0.9375rem", display: "flex", alignItems: "center", gap: 6 }}>
                      <LuSiren size={16} style={{ color: colors.danger }} /> {a.title}
                    </strong>
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

          {/* Post markers */}
          {showPosts && posts.map((post) => {
            if (!post.stationId) return null;
            const station = stations.find((s) => s.id === post.stationId);
            if (!station) return null;

            const jitteredCoords = getJitteredCoords(station.lat, station.lng, post.id);

            return (
              <Marker
                key={post.id}
                position={jitteredCoords}
                icon={newspaperIcon}
              >
                <Popup>
                  <div style={{ textAlign: "right", direction: "rtl", minWidth: 200, maxWidth: 250 }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        direction: "ltr",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                        borderBottom: "1px solid #f0f0f0",
                        paddingBottom: 6,
                      }}
                    >
                      <div style={{ textAlign: "right" }}>
                        <strong style={{ fontSize: "0.875rem", display: "block" }}>{post.authorName ?? "אנונימי"}</strong>
                        <span style={{ fontSize: "0.6875rem", color: "#888" }}>
                          {formatPostDate(post.createdAt)}
                        </span>
                      </div>
                      {post.authorPhoto ? (
                        <img
                          src={post.authorPhoto}
                          alt=""
                          referrerPolicy="no-referrer"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#eee",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#888",
                          }}
                        >
                          <LuUser size={16} />
                        </div>
                      )}
                    </div>
                    {post.value && (
                      <div
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: "rgba(147, 51, 234, 0.1)",
                          color: "#9333ea",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          marginBottom: 6,
                        }}
                      >
                        {post.value}
                      </div>
                    )}
                    {post.text && (
                      <p style={{ margin: "4px 0", fontSize: "0.8125rem", color: "#333", lineHeight: 1.4 }}>
                        {post.text}
                      </p>
                    )}
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt="feed"
                        referrerPolicy="no-referrer"
                        style={{
                          width: "100%",
                          maxHeight: 120,
                          objectFit: "cover",
                          borderRadius: 4,
                          marginTop: 6,
                        }}
                      />
                    )}
                    <div style={{ marginTop: 6, fontSize: "0.6875rem", color: "var(--c-muted)" }}>
                      תחנה: {station.name}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
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
          direction: "rtl",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 700, marginLeft: "var(--sp-xs)", display: "flex", alignItems: "center", gap: 6 }}>
          <LuMap size={14} /> מקרא מפה:
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: colors.forest,
            color: "#fff",
          }}>
            <LuSmartphone size={12} />
          </span>{" "}
          מטיילים
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: colors.sky,
            color: "#fff",
          }}>
            <LuRadio size={12} />
          </span>{" "}
          חיישנים
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: colors.forest,
            color: "#fff",
          }}>
            <LuMapPin size={12} />
          </span>{" "}
          תחנות
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: colors.terracotta,
            color: "#fff",
          }}>
            <LuClipboardList size={12} />
          </span>{" "}
          משימות NFR
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: colors.danger,
            color: "#fff",
          }}>
            <LuSiren size={12} />
          </span>{" "}
          התראות GPS
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "var(--c-gold)",
            color: "#fff",
          }}>
            <LuFlame size={12} />
          </span>{" "}
          לפיד
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#9333ea",
            color: "#fff",
          }}>
            <LuNewspaper size={12} />
          </span>{" "}
          פוסטים
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-block",
              width: 16,
              height: 4,
              background: colors.terracotta,
              borderRadius: 2,
            }}
          />{" "}
          מסלול השביל
        </span>
      </div>
    </div>
  );
}
