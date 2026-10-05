import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  ArrowLeft,
  MapPin,
  Flag,
  Navigation as NavIcon,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import Clock from "./Clock";
import { getThemeClasses, getTimeOfDay } from "../../utils/time";
import { DEMO_DESTINATION } from "../../utils/location";

// Leaflet default marker images break under Vite — we use DivIcons instead.
import "leaflet/dist/leaflet.css";

/** Fit map bounds to pickup + destination when they change */
function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (!positions?.length) return;
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
  }, [map, positions]);
  return null;
}

/** Build a Leaflet DivIcon from inline SVG (Lucide-style) */
function createLucideDivIcon({ bg, stroke, pathD, label }) {
  const html = `
    <div style="
      display:flex;flex-direction:column;align-items:center;
      transform:translate(-50%,-100%);
    ">
      <div style="
        width:36px;height:36px;border-radius:9999px;
        background:${bg};border:2px solid #fff;
        box-shadow:0 2px 8px rgba(1,1,56,0.25);
        display:flex;align-items:center;justify-content:center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
          viewBox="0 0 24 24" fill="none" stroke="${stroke}"
          stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
          <path d="${pathD}"/>
        </svg>
      </div>
      ${
        label
          ? `<span style="
              margin-top:2px;padding:1px 6px;border-radius:9999px;
              background:#010138;color:#fff;font-size:10px;font-weight:600;
              white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.2);
            ">${label}</span>`
          : ""
      }
    </div>
  `;
  return L.divIcon({
    className: "",
    html,
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    popupAnchor: [0, -40],
  });
}

// Lucide MapPin path
const PIN_PATH =
  "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z M12 10 a2 2 0 1 0 0.001 0";
// Lucide Flag path (simplified)
const FLAG_PATH =
  "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7";

const pickupIcon = createLucideDivIcon({
  bg: "#4D4DE9",
  stroke: "#FFFFFF",
  pathD: PIN_PATH,
  label: "Pickup",
});

const destinationIcon = createLucideDivIcon({
  bg: "#010138",
  stroke: "#BDF6CC",
  pathD: FLAG_PATH,
  label: "Drop-off",
});

/**
 * Driver Navigation / live route map (react-leaflet + OpenStreetMap).
 *
 * Props:
 * - pickup / destination: { lat, lng, name, address }
 * - onBack, onCancelTrip, onArrived
 * - timeOfDay / isNight for theme
 */
const NavigationScreen = ({
  pickup = {
    lat: 7.2935,
    lng: 80.641,
    name: "Warehouse Hub",
    address: "Depot A, Kandy",
  },
  destination = {
    lat: DEMO_DESTINATION.lat,
    lng: DEMO_DESTINATION.lng,
    name: "Green Mart",
    address: "No.125, Peradeniya Rd",
    eta: "08:17 AM",
  },
  nextStop,
  onBack,
  onCancelTrip,
  onArrived,
  onNavigateToStop,
  timeOfDay,
  isNight,
}) => {
  const navigate = useNavigate();
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);

  // Dest falls back to nextStop name if provided
  const dest = {
    ...destination,
    name: nextStop?.name || destination.name,
    address: nextStop?.address || destination.address,
    eta: nextStop?.eta || destination.eta,
  };

  const [isArrived, setIsArrived] = useState(false);

  const pickupPos = useMemo(
    () => [pickup.lat, pickup.lng],
    [pickup.lat, pickup.lng]
  );
  const destPos = useMemo(
    () => [dest.lat, dest.lng],
    [dest.lat, dest.lng]
  );
  const routeLine = useMemo(
    () => [pickupPos, destPos],
    [pickupPos, destPos]
  );

  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
      return;
    }
    navigate(-1);
  };

  const handleArrived = () => {
    if (!isArrived) return;
    onArrived?.();
    onNavigateToStop?.(1, dest.name);
  };

  return (
    <div
      className={`flex flex-col h-[100dvh] max-h-[100dvh] overflow-hidden ${theme.pageBg}`}
    >
      {/* Header */}
      <div
        className={`${theme.headerBg} px-3 pt-4 pb-3 flex items-center gap-2 shrink-0 z-[1000]`}
      >
        <button
          type="button"
          onClick={handleBack}
          className="p-2 rounded-full bg-white/10 text-whiteCustom active:scale-95 transition-transform"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2.25} />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-whiteCustom text-heading truncate">Route Map</h3>
          <p className="text-neutral3 text-smallText truncate">
            {pickup.name} → {dest.name}
          </p>
        </div>
        <Clock className="text-neutral3 shrink-0" showIcon />
      </div>

      {/* Map — fills remaining space above action panel */}
      <div className="relative flex-1 min-h-0 w-full">
        <MapContainer
          center={pickupPos}
          zoom={13}
          className="absolute inset-0 z-0 h-full w-full"
          zoomControl={false}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds positions={routeLine} />

          {/* Route polyline */}
          <Polyline
            positions={routeLine}
            pathOptions={{
              color: "#4D4DE9",
              weight: 5,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
          />

          {/* Pickup marker */}
          <Marker position={pickupPos} icon={pickupIcon}>
            <Popup>
              <strong>Pickup</strong>
              <br />
              {pickup.name}
              <br />
              <span style={{ fontSize: 12, color: "#5F5F79" }}>
                {pickup.address}
              </span>
            </Popup>
          </Marker>

          {/* Destination marker */}
          <Marker position={destPos} icon={destinationIcon}>
            <Popup>
              <strong>Destination</strong>
              <br />
              {dest.name}
              <br />
              <span style={{ fontSize: 12, color: "#5F5F79" }}>
                {dest.address}
              </span>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Bottom action panel */}
      <div
        className={`shrink-0 z-[1000] ${theme.cardBg} border-t ${theme.border} px-4 pt-3 pb-4 space-y-3 shadow-card-lg`}
      >
        {/* Next stop summary */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-neutral1 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-purplePrimary" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-smallText ${theme.textMuted}`}>Destination</p>
            <h3 className={`text-paragraph ${theme.textPrimary} truncate`}>
              {dest.name}
            </h3>
            <p className={`text-secondaryText ${theme.textMuted} truncate`}>
              {dest.address}
              {dest.eta ? ` · ETA ${dest.eta}` : ""}
            </p>
          </div>
          <Flag className={`w-5 h-5 ${theme.textMuted} shrink-0`} />
        </div>

        {/* Primary: Arrived Destination (disabled until simulate / real arrival) */}
        <button
          type="button"
          disabled={!isArrived}
          aria-disabled={!isArrived}
          onClick={handleArrived}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-medium text-paragraph transition-all ${
            isArrived
              ? `${theme.accent} active:scale-[0.98]`
              : "bg-gray3 text-gray5 cursor-not-allowed opacity-70"
          }`}
        >
          {isArrived ? (
            <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
          ) : (
            <AlertCircle className="w-5 h-5" strokeWidth={2} />
          )}
          {isArrived ? "Arrived Destination" : "Arrive at stop to unlock"}
        </button>

        {/* Secondary: Cancel Trip */}
        <button
          type="button"
          onClick={() => onCancelTrip?.() ?? handleBack()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-secondaryPink text-secondaryPink font-medium text-paragraph active:scale-[0.98] transition-transform"
        >
          <XCircle className="w-5 h-5" strokeWidth={2} />
          Cancel Trip
        </button>

        {/* Hackathon dev control */}
        <button
          type="button"
          onClick={() => setIsArrived(true)}
          className={`w-full text-center text-smallText ${theme.textMuted} underline-offset-2 hover:underline py-1`}
        >
          Dev: Simulate Arrival
        </button>
      </div>
    </div>
  );
};

export default NavigationScreen;
