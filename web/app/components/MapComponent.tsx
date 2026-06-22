"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// תיקון אייקונים דיפולטיביים של Leaflet בסביבת Next.js
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon.src || markerIcon,
  iconRetinaUrl: markerIcon2x.src || markerIcon2x,
  shadowUrl: markerShadow.src || markerShadow,
});

// הגדרת אייקונים מותאמים אישית (כתובות יציבות של סיכות גוגל מפס למניעת קריסות תמונות מקומיות)
const stationIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png", // סיכות ירוקות לתחנות
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const liveUserIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png", // סיכות כחולות למשתמשים/רצים חיים מה-DB
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const torchIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png", // סיכה כתומה ללפיד הפיזי
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

// Interfaces והגדרת טיפוסים
interface Station {
  id: string;
  number: number;
  name: string;
  lat: number;
  lng: number;
  locationText?: string;
  whatYouDo?: string;
  value: string;
}

interface RouteWaypoint {
  name: string;
  lat: number;
  lng: number;
}

interface LivePin {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  source?: "phone" | "sensor";
  speed?: number;
  ts?: number;
}

interface TorchState {
  status: "waiting" | "held";
  lat: number;
  lng: number;
  holderName?: string;
}

interface MapComponentProps {
  stations: Station[];
  routes: RouteWaypoint[];
  livePins?: LivePin[];
  torch?: TorchState | null;
  onSelectStation?: (station: Station) => void;
}

/**
 * קומפוננטת עזר פנימית לחישוב דינמי של גבולות המפה (Bounds) וביצוע מרכוז
 */
function RecenterMap({ stations, routes, livePins, torch }: MapComponentProps) {
  const map = useMap();

  useEffect(() => {
    const allLatLngs: L.LatLngExpression[] = [];

    routes.forEach((r) => {
      if (r.lat && r.lng) allLatLngs.push([r.lat, r.lng]);
    });

    stations.forEach((st) => {
      if (st.lat && st.lng) allLatLngs.push([st.lat, st.lng]);
    });

    livePins?.forEach((pin) => {
      if (pin.lat && pin.lng) allLatLngs.push([pin.lat, pin.lng]);
    });

    if (torch && torch.lat && torch.lng) {
      allLatLngs.push([torch.lat, torch.lng]);
    }

    if (allLatLngs.length > 0) {
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 13,
        animate: true,
      });
    }
  }, [stations, routes, livePins, torch, map]);

  return null;
}

export default function MapComponent({
  stations = [],
  routes = [],
  livePins = [],
  torch = null,
  onSelectStation,
}: MapComponentProps) {
  
  const polylinePositions = routes
    .filter((r) => r.lat && r.lng)
    .map((r) => [r.lat, r.lng] as L.LatLngExpression);

  const defaultCenter: L.LatLngExpression = [32.73, 35.3];

  return (
    <div style={{ height: "100%", width: "100%", minHeight: "500px", position: "relative" }}>
      <MapContainer
        center={defaultCenter}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* שרטוט תוואי השביל */}
        {polylinePositions.length > 0 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{ color: "#2C6E49", weight: 5, opacity: 0.8 }} 
          />
        )}

        {/* 13 תחנות הערכים/התנדבות */}
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={stationIcon}
            eventHandlers={{
              click: () => onSelectStation && onSelectStation(station)
            }}
          >
            <Popup>
              <div style={{ textAlign: "right", direction: "rtl" }}>
                <strong style={{ fontSize: "14px" }}>
                  תחנה {station.number}: {station.name}
                </strong>
                {station.locationText && <p style={{ margin: "4px 0" }}>📍 {station.locationText}</p>}
                {station.whatYouDo && (
                  <p style={{ margin: "4px 0", fontSize: "12px", color: "#555" }}>
                    <strong>מה עושים:</strong> {station.whatYouDo}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 🚀 סיכות משתמשים/חיישנים בזמן אמת מתוך ה-DB (Live Pins) */}
        {livePins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng]}
            icon={liveUserIcon}
          >
            <Popup>
              <div style={{ textAlign: "right", direction: "rtl" }}>
                <strong style={{ fontSize: "14px", color: "#1e40af" }}>
                  👤 {pin.name || "מטייל/ת בשביל"}
                </strong>
                <p style={{ margin: "4px 0 2px 0", fontSize: "12px" }}>
                  <strong>מיקום:</strong> {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
                </p>
                {pin.speed !== undefined && pin.speed !== -1 && (
                  <p style={{ margin: "2px 0", fontSize: "12px" }}>
                    <strong>מהירות:</strong> {pin.speed} קמ"ש
                  </p>
                )}
                <p style={{ margin: "4px 0 0 0", fontSize: "11px", color: "#666" }}>
                  מקור: {pin.source === "sensor" ? "📟 חיישן בגד (IoT)" : "📱 אפליקציית מובייל"}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* מיקום הלפיד האקטיבי בשטח (Torch) */}
        {torch && torch.lat && torch.lng && (
          <Marker position={[torch.lat, torch.lng]} icon={torchIcon}>
            <Popup>
              <div style={{ textAlign: "right", direction: "rtl" }}>
                <strong>🔥 הלפיד הוירטואלי</strong>
                <p style={{ margin: "2px 0" }}>
                  סטטוס: {torch.status === "held" ? `מוחזק ע"י ${torch.holderName || "רץ"}` : "ממתין בשטח לבא בתור"}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        <RecenterMap
          stations={stations}
          routes={routes}
          livePins={livePins}
          torch={torch}
        />
      </MapContainer>
    </div>
  );
}