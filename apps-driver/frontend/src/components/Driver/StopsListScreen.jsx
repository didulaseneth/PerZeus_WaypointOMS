import { MapPin, ChevronRight, Package, Clock, Navigation } from "lucide-react";
import ClockWidget from "./Clock";
import { getThemeClasses, getTimeOfDay } from "../../utils/time";

/**
 * Stops list screen — restored intermediate screen for the "Stops" tab.
 * Shows all of today's stops; tapping one opens Stop Details.
 */
const DEFAULT_STOPS = [
  {
    id: 1,
    number: 1,
    name: "Green Mart",
    address: "No.125, Peradeniya Road, Kandy",
    eta: "08:17 AM",
    distance: "2.3 km",
    status: "Next",
    statusKey: "next",
    itemsCount: 22,
  },
  {
    id: 2,
    number: 2,
    name: "City Super",
    address: "42 Colombo Street, Kandy",
    eta: "09:05 AM",
    distance: "4.1 km",
    status: "Pending",
    statusKey: "pending",
    itemsCount: 15,
  },
  {
    id: 3,
    number: 3,
    name: "Fresh Basket",
    address: "8 Temple Road, Peradeniya",
    eta: "10:20 AM",
    distance: "6.8 km",
    status: "Pending",
    statusKey: "pending",
    itemsCount: 9,
  },
  {
    id: 4,
    number: 4,
    name: "Daily Needs",
    address: "101 Kandy Road, Katugastota",
    eta: "11:15 AM",
    distance: "9.2 km",
    status: "Pending",
    statusKey: "pending",
    itemsCount: 18,
  },
  {
    id: 5,
    number: 5,
    name: "Mart Plus",
    address: "3 Railway Avenue, Kandy",
    eta: "12:00 PM",
    distance: "11.5 km",
    status: "Pending",
    statusKey: "pending",
    itemsCount: 7,
  },
];

const statusClass = (key, theme) => {
  if (key === "completed") return theme.success;
  if (key === "next") return "bg-purplePrimary/15 text-purplePrimary";
  return `${theme.cardBgAlt} ${theme.textMuted}`;
};

const StopsListScreen = ({
  stops = DEFAULT_STOPS,
  onSelectStop,
  onNavigateToRoute,
  timeOfDay,
  isNight,
}) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);

  const remaining = stops.filter((s) => s.statusKey !== "completed").length;

  return (
    <div className={`flex flex-col min-h-[100dvh] min-h-screen ${theme.pageBg} pb-24`}>
      <div
        className={`${theme.headerBg} px-5 pt-6 pb-4 flex items-center justify-between`}
      >
        <div>
          <h3 className="text-whiteCustom text-heading">Today&apos;s Stops</h3>
          <p className="text-neutral3 text-secondaryText mt-0.5">
            {remaining} remaining · {stops.length} total
          </p>
        </div>
        <ClockWidget className="text-neutral3" showIcon />
      </div>

      <div className="px-4 pt-4 space-y-2.5">
        <button
          type="button"
          onClick={onNavigateToRoute}
          className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border ${theme.border} ${theme.cardBg} ${theme.shadow} active:scale-[0.99] transition-transform`}
        >
          <div className="w-10 h-10 rounded-xl bg-neutral1 flex items-center justify-center shrink-0">
            <Navigation className="w-5 h-5 text-purplePrimary" strokeWidth={2} />
          </div>
          <div className="text-left flex-1 min-w-0">
            <h4 className={`text-paragraph ${theme.textPrimary}`}>Open Route Map</h4>
            <p className={`text-smallText ${theme.textMuted}`}>
              Navigate with live map view
            </p>
          </div>
          <ChevronRight className={`w-5 h-5 ${theme.textMuted}`} />
        </button>

        {stops.map((stop) => (
          <button
            key={stop.id}
            type="button"
            onClick={() => onSelectStop?.(stop)}
            className={`w-full flex items-start gap-3 p-4 rounded-2xl border ${theme.border} ${theme.cardBg} text-left active:scale-[0.99] transition-transform ${theme.shadow}`}
          >
            <div className="w-10 h-10 rounded-xl bg-purplePrimary text-whiteCustom flex items-center justify-center shrink-0 text-paragraph font-bold">
              {stop.number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className={`text-paragraph ${theme.textPrimary} truncate`}>
                  {stop.name}
                </h4>
                <span
                  className={`shrink-0 text-smallText font-medium px-2 py-0.5 rounded-full ${statusClass(
                    stop.statusKey,
                    theme
                  )}`}
                >
                  {stop.status}
                </span>
              </div>
              <p
                className={`text-secondaryText ${theme.textMuted} mt-0.5 flex items-center gap-1 truncate`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {stop.address}
              </p>
              <div
                className={`flex items-center gap-3 mt-1.5 text-smallText ${theme.textMuted}`}
              >
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ETA {stop.eta}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  {stop.itemsCount} items
                </span>
                <span>{stop.distance}</span>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 ${theme.textMuted} shrink-0 mt-2`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default StopsListScreen;
