import {
  Package,
  Snowflake,
  Box,
  CheckCircle2,
} from "lucide-react";
import Clock from "./Clock";
import { getThemeClasses, getTimeOfDay } from "../../utils/time";

/**
 * Stop Details screen – order items, instructions, mark arrived.
 */
const StopDetailsScreen = ({
  stop = {
    number: 2,
    name: "Green Mart",
    address: "No.125, Peradeniya Road, Kandy",
    eta: "08:17 AM",
    distance: "2.3 km",
    status: "On Time",
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
}) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);

  const typeIcon = {
    produce: Package,
    chilled: Snowflake,
    dry: Box,
  };

  return (
    <div className={`flex flex-col min-h-full ${theme.pageBg} pb-24`}>
      {/* Header */}
      <div className={`${theme.headerBg} px-5 pt-6 pb-4 flex items-center justify-between`}>
        <h3 className="text-whiteCustom text-heading">Stop Details</h3>
        <Clock className="text-neutral3" showIcon />
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Stop card */}
        <div className={`${theme.cardBg} rounded-2xl p-4 border ${theme.border} shadow-sm`}>
          <h2 className={`text-subtitle ${theme.textPrimary}`}>
            {stop.number}. {stop.name}
          </h2>
          <p className={`text-secondaryText ${theme.textMuted} mt-1`}>{stop.address}</p>
          <p className={`text-secondaryText ${theme.textMuted}`}>
            ETA {stop.eta} • {stop.distance}
          </p>
          <span
            className={`inline-block mt-2 px-2.5 py-1 rounded-full text-smallText font-medium ${theme.success}`}
          >
            {stop.status}
          </span>
        </div>

        {/* Items */}
        <div>
          <h4 className={`text-paragraph ${theme.textPrimary} mb-2.5 flex items-center gap-2`}>
            <Package className="w-4 h-4 text-purplePrimary" />
            Order Items ({stop.items.length})
          </h4>
          <div className="space-y-2">
            {stop.items.map((item) => {
              const Icon = typeIcon[item.type] || Box;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-xl ${theme.cardBg} border ${theme.border}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral1 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-purplePrimary" strokeWidth={2} />
                    </div>
                    <div>
                      <h5 className={`text-paragraph ${theme.textPrimary}`}>{item.name}</h5>
                      <p className={`text-smallText ${theme.textMuted}`}>{item.detail}</p>
                    </div>
                  </div>
                  <span className={`text-heading ${theme.textPrimary}`}>{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className={`p-3.5 rounded-xl ${theme.cardBgAlt} border ${theme.border}`}>
          <strong className={`text-secondaryText ${theme.textPrimary}`}>Delivery Instructions:</strong>
          <p className={`text-secondaryText ${theme.textMuted} mt-1`}>{stop.instructions}</p>
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onMarkArrived}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl ${theme.accent} font-medium text-paragraph active:scale-[0.98] transition-transform`}
        >
          <CheckCircle2 className="w-5 h-5" strokeWidth={2} />
          Mark as Arrived
        </button>
      </div>
    </div>
  );
};

export default StopDetailsScreen;
