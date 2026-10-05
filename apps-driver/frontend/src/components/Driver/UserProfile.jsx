import {
  User,
  Truck,
  CreditCard,
  Clock,
  WifiOff,
  Globe,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { getThemeClasses, getTimeOfDay } from "../../utils/time";

/**
 * Isolated User Profile section for the Driver role.
 * Can be commented out / removed independently without affecting other screens.
 *
 * Props:
 * - driver: { name, initials, role, id }
 * - onNavigate: (screenId) => void
 * - onLogout: () => void
 */
const UserProfile = ({
  driver = {
    name: "Kasun Perera",
    initials: "KP",
    role: "Driver",
    id: "DLV-0123",
  },
  onNavigate = () => {},
  onLogout = () => {},
  timeOfDay,
  isNight,
}) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);

  const menuItems = [
    { id: "my-profile", label: "My Profile", icon: User, screen: "my-profile" },
    { id: "vehicle", label: "Vehicle Details", icon: Truck, screen: "vehicle" },
    { id: "license", label: "Driving License", icon: CreditCard, screen: "license" },
    { id: "shift", label: "Shift Information", icon: Clock, screen: "shift" },
    { id: "offline", label: "Offline Mode", icon: WifiOff, screen: "offline" },
    { id: "language", label: "Language", icon: Globe, screen: "language", rightText: "English" },
  ];

  return (
    <div className={`flex flex-col min-h-[100dvh] min-h-screen ${theme.pageBg} transition-colors duration-300`}>
      {/* Profile header */}
      <div className={`${theme.headerBg} px-5 pt-10 pb-8 rounded-b-3xl text-center`}>
        <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-purplePrimary flex items-center justify-center">
          <span className="text-whiteCustom text-heading font-bold">{driver.initials}</span>
        </div>
        <h2 className="text-whiteCustom text-heading">{driver.name}</h2>
        <p className="text-neutral3 text-secondaryText mt-1">
          {driver.role} • {driver.id}
        </p>
      </div>

      {/* Settings list */}
      <div className="flex-1 px-4 py-5 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.screen)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl ${theme.cardBg} ${theme.border} border shadow-sm active:scale-[0.98] transition-transform`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${theme.cardBgAlt} flex items-center justify-center`}>
                  <Icon className="w-4.5 h-4.5 text-purplePrimary" strokeWidth={2} />
                </div>
                <h4 className={`text-paragraph ${theme.textPrimary}`}>{item.label}</h4>
              </div>
              {item.rightText ? (
                <span className={`text-secondaryText ${theme.textMuted}`}>{item.rightText}</span>
              ) : (
                <ChevronRight className={`w-5 h-5 ${theme.textMuted}`} strokeWidth={2} />
              )}
            </button>
          );
        })}
      </div>

      {/* Logout */}
      <div className="px-4 pb-24 pt-2">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-secondaryPink text-secondaryPink font-medium text-paragraph active:scale-[0.98] transition-transform"
        >
          <LogOut className="w-5 h-5" strokeWidth={2} />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
