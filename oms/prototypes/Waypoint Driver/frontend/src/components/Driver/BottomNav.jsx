import { Home, Navigation, Package, Mail, User } from "lucide-react";
import { getThemeClasses, getTimeOfDay } from "../../utils/time";

/**
 * Fixed bottom navigation for Driver screens.
 * Premium mobile-first design with active pill indicator.
 * Adapts colors for morning / evening / night themes.
 */
const BottomNav = ({ activeScreen, onNavigate, timeOfDay, isNight }) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);
  const isDark = theme.isDark;

  const items = [
    { id: "dashboard", label: "Home", icon: Home },
    { id: "navigation", label: "Route", icon: Navigation },
    { id: "stops", label: "Stops", icon: Package },
    { id: "inbox", label: "Inbox", icon: Mail },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto ${theme.navBg} border-t ${theme.border} shadow-card-lg transition-colors duration-300`}
      role="navigation"
      aria-label="Driver main navigation"
    >
      <div className="flex items-end justify-around px-2 pt-2 pb-3">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center min-w-[52px] py-1 px-2 rounded-2xl transition-all duration-200 ${
                isActive
                  ? "text-purplePrimary"
                  : `${theme.navInactive} hover:text-purplePrimary`
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Active pill indicator */}
              {isActive && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-purplePrimary" />
              )}
              {/* Icon container */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-colors duration-200 ${
                  isActive
                    ? isDark
                      ? "bg-purplePrimary/20 text-purplePrimary"
                      : period === "evening"
                      ? "bg-secondaryYellow/40 text-purplePrimary"
                      : "bg-neutral1"
                    : "bg-transparent"
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-110" : "scale-100"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={`text-smallText font-semibold leading-tight mt-0.5 ${
                  isActive ? "text-purplePrimary" : theme.navInactive
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
