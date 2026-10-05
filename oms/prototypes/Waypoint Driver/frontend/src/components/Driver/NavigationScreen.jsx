import { MapPin, Navigation as NavIcon } from "lucide-react";
import Clock from "./Clock";
import { getThemeClasses, getTimeOfDay } from "../../utils/time";

/**
 * Route / Navigation screen with map placeholder and next-stop card.
 * Uses brand colors; map is a styled placeholder (integrate Leaflet/Mapbox later).
 */
const NavigationScreen = ({
  nextStop = {
    name: "Green Mart",
    address: "No.125, Peradeniya Rd",
    eta: "08:17 AM",
    stopNumber: 1,
  },
  stops = [
    { id: 1, name: "Green Mart", top: "20%", left: "30%" },
    { id: 2, name: "Stop 2", top: "40%", left: "60%" },
    { id: 3, name: "Stop 3", top: "60%", left: "40%" },
    { id: 4, name: "Stop 4", top: "70%", left: "70%" },
  ],
  onNavigateToStop,
  timeOfDay,
  isNight,
}) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);

  return (
    <div className={`flex flex-col min-h-full ${theme.pageBg} pb-24`}>
      {/* Header */}
      <div className={`${theme.headerBg} px-5 pt-6 pb-4 flex items-center justify-between`}>
        <h3 className="text-whiteCustom text-heading">Route Map</h3>
        <Clock className="text-neutral3" showIcon />
      </div>

      {/* Map area */}
      <div className="relative flex-1 min-h-[320px] bg-neutral2 mx-0">
        {/* Simple SVG route line (placeholder) */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M 30 20 Q 45 35 60 40 T 40 60 T 70 70"
            fill="none"
            stroke="#4D4DE9"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Stop markers */}
        {stops.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onNavigateToStop?.(s.id, s.name)}
            className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purplePrimary text-whiteCustom text-smallText font-bold flex items-center justify-center shadow-md border-2 border-whiteCustom"
            style={{ top: s.top, left: s.left }}
            aria-label={`Stop ${s.id}: ${s.name}`}
          >
            {s.id}
          </button>
        ))}
      </div>

      {/* Next stop card */}
      <div className={`mx-4 -mt-6 relative z-10 ${theme.cardBg} rounded-2xl p-4 shadow-lg border ${theme.border}`}>
        <h4 className={`text-secondaryText ${theme.textMuted} mb-2`}>Next Stop</h4>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-neutral1 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-purplePrimary" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={`text-paragraph ${theme.textPrimary}`}>{nextStop.name}</h3>
            <p className={`text-secondaryText ${theme.textMuted} truncate`}>
              {nextStop.address} • ETA {nextStop.eta}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigateToStop?.(nextStop.stopNumber, nextStop.name)}
          className={`mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl ${theme.accent} font-medium text-paragraph active:scale-[0.98] transition-transform`}
        >
          <NavIcon className="w-5 h-5" strokeWidth={2} />
          Navigate
        </button>
      </div>
    </div>
  );
};

export default NavigationScreen;
