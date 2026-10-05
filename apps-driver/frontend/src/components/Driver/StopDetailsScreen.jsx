import { useState, useEffect, useMemo } from "react";
import {
  Package,
  Snowflake,
  Box,
  CheckCircle2,
  MapPin,
  Navigation,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Clock from "./Clock";
import { getThemeClasses, getTimeOfDay } from "../../utils/time";
import {
  watchDriverPosition,
  hasReachedDestination,
  distanceMeters,
  DEFAULT_ARRIVAL_RADIUS_M,
  DEMO_DESTINATION,
} from "../../utils/location";

/**
 * Stop Details screen – order items, instructions, and
 * "Arrived Destination" button that stays DISABLED until the driver
 * is within DEFAULT_ARRIVAL_RADIUS_M of the stop coordinates.
 */
const StopDetailsScreen = ({
  stop = {
    number: 2,
    name: "Green Mart",
    address: "No.125, Peradeniya Road, Kandy",
    eta: "08:17 AM",
    distance: "2.3 km",
    status: "On Time",
    // Delivery endpoint coordinates (required for arrival check)
    lat: DEMO_DESTINATION.lat,
    lng: DEMO_DESTINATION.lng,
    items: [
      { id: 1, name: "Fresh Groceries", detail: "12 items", count: 12, type: "produce" },
      { id: 2, name: "Chilled Products", detail: "4 items", count: 4, type: "chilled" },
      { id: 3, name: "Dry Goods", detail: "6 items", count: 6, type: "dry" },
    ],
    instructions:
      "Use back entrance. Contact store manager if the gate is closed.",
  },
  onMarkArrived,
  timeOfDay,
  isNight,
  arrivalRadiusM = DEFAULT_ARRIVAL_RADIUS_M,
}) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);

  const typeIcon = {
    produce: Package,
    chilled: Snowflake,
    dry: Box,
  };

  const destLat = stop.lat ?? DEMO_DESTINATION.lat;
  const destLng = stop.lng ?? DEMO_DESTINATION.lng;

  const [position, setPosition] = useState({
    lat: null,
    lng: null,
    accuracy: null,
    error: null,
    supported: true,
  });
  // Dev / demo override when GPS is unavailable (desktop browsers, denied permission)
  const [simulatedArrival, setSimulatedArrival] = useState(false);

  useEffect(() => {
    const stopWatch = watchDriverPosition(setPosition);
    return stopWatch;
  }, []);

  const distanceToStop = useMemo(() => {
    if (position.lat == null || position.lng == null) return null;
    return distanceMeters(position.lat, position.lng, destLat, destLng);
  }, [position.lat, position.lng, destLat, destLng]);

  const isAtDestination =
    simulatedArrival ||
    hasReachedDestination(
      position.lat,
      position.lng,
      destLat,
      destLng,
      arrivalRadiusM
    );

  const canArrive = isAtDestination;

  return (
    <div className={`flex flex-col min-h-[100dvh] min-h-screen ${theme.pageBg} pb-24`}>
      {/* Header */}
      <div
        className={`${theme.headerBg} px-5 pt-6 pb-4 flex items-center justify-between`}
      >
        <h3 className="text-whiteCustom text-heading">Stop Details</h3>
        <Clock className="text-neutral3" showIcon />
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Stop card */}
        <div
          className={`${theme.cardBg} rounded-2xl p-4 border ${theme.border} ${theme.shadow}`}
        >
          <h2 className={`text-subtitle ${theme.textPrimary}`}>
            {stop.number}. {stop.name}
          </h2>
          <p className={`text-secondaryText ${theme.textMuted} mt-1`}>
            {stop.address}
          </p>
          <p className={`text-secondaryText ${theme.textMuted}`}>
            ETA {stop.eta} • {stop.distance}
          </p>
          <span
            className={`inline-block mt-2 px-2.5 py-1 rounded-full text-smallText font-medium ${theme.success}`}
          >
            {stop.status}
          </span>
        </div>

        {/* Live proximity status */}
        <div
          className={`p-3.5 rounded-xl border ${theme.border} ${theme.cardBgAlt}`}
        >
          <div className="flex items-start gap-2.5">
            {position.lat == null && !position.error ? (
              <Loader2 className="w-5 h-5 text-purplePrimary animate-spin shrink-0 mt-0.5" />
            ) : isAtDestination ? (
              <CheckCircle2 className="w-5 h-5 text-purplePrimary shrink-0 mt-0.5" />
            ) : (
              <Navigation className="w-5 h-5 text-purplePrimary shrink-0 mt-0.5" />
            )}
            <div className="min-w-0 flex-1">
              <p className={`text-paragraph ${theme.textPrimary}`}>
                {isAtDestination
                  ? "You have arrived at the destination"
                  : "En route to destination"}
              </p>
              <p className={`text-smallText ${theme.textMuted} mt-0.5`}>
                {simulatedArrival
                  ? "Arrival simulated for demo"
                  : distanceToStop != null
                    ? `${Math.round(distanceToStop)} m away · unlock within ${arrivalRadiusM} m`
                    : position.error
                      ? position.error
                      : "Waiting for GPS…"}
              </p>
              {position.accuracy != null && !simulatedArrival && (
                <p className={`text-smallText ${theme.textMuted}`}>
                  GPS accuracy ±{Math.round(position.accuracy)} m
                </p>
              )}
            </div>
            <MapPin className={`w-4 h-4 ${theme.textMuted} shrink-0`} />
          </div>

          {/* Demo helper when GPS blocked / desktop */}
          {!isAtDestination && (position.error || !position.supported) && (
            <button
              type="button"
              onClick={() => setSimulatedArrival(true)}
              className={`mt-3 w-full py-2 rounded-xl border ${theme.accentOutline} text-secondaryText font-medium`}
            >
              Simulate arrival (demo)
            </button>
          )}
        </div>

        {/* Items */}
        <div>
          <h4
            className={`text-paragraph ${theme.textPrimary} mb-2.5 flex items-center gap-2`}
          >
            <Package className="w-4 h-4 text-purplePrimary" />
            Order Items ({stop.items?.length ?? 0})
          </h4>
          <div className="space-y-2">
            {(stop.items || []).map((item) => {
              const Icon = typeIcon[item.type] || Box;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-xl ${theme.cardBg} border ${theme.border}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral1 flex items-center justify-center">
                      <Icon
                        className="w-5 h-5 text-purplePrimary"
                        strokeWidth={2}
                      />
                    </div>
                    <div>
                      <h5 className={`text-paragraph ${theme.textPrimary}`}>
                        {item.name}
                      </h5>
                      <p className={`text-smallText ${theme.textMuted}`}>
                        {item.detail}
                      </p>
                    </div>
                  </div>
                  <span className={`text-heading ${theme.textPrimary}`}>
                    {item.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div
          className={`p-3.5 rounded-xl ${theme.cardBgAlt} border ${theme.border}`}
        >
          <strong className={`text-secondaryText ${theme.textPrimary}`}>
            Delivery Instructions:
          </strong>
          <p className={`text-secondaryText ${theme.textMuted} mt-1`}>
            {stop.instructions}
          </p>
        </div>

        {/* Arrived Destination CTA — disabled until at endpoint */}
        <button
          type="button"
          onClick={() => canArrive && onMarkArrived?.()}
          disabled={!canArrive}
          aria-disabled={!canArrive}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-medium text-paragraph transition-all ${
            canArrive
              ? `${theme.accent} active:scale-[0.98]`
              : "bg-gray3 text-gray5 cursor-not-allowed opacity-70"
          }`}
        >
          {canArrive ? (
            <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
          ) : (
            <AlertCircle className="w-5 h-5" strokeWidth={2} />
          )}
          {canArrive ? "Arrived Destination" : "Arrive at stop to unlock"}
        </button>
      </div>
    </div>
  );
};

export default StopDetailsScreen;
