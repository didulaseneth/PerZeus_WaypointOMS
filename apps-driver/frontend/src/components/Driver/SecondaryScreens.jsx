import {
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  Eye,
  AlertTriangle,
  MapPin,
  ArrowLeft,
  Fuel,
  Package,
  Clock,
  WifiOff,
  Check,
  Truck,
  CreditCard,
  User,
  Globe,
  Phone,
  Mail,
} from "lucide-react";
import ClockWidget from "./Clock";
import { getThemeClasses, getTimeOfDay } from "../../utils/time";

const ScreenHeader = ({ title, onBack, theme }) => (
  <div className={`${theme.headerBg} px-5 pt-6 pb-4 flex items-center justify-between`}>
    <div className="flex items-center gap-3">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 rounded-full bg-white/10 text-whiteCustom"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <h3 className="text-whiteCustom text-heading">{title}</h3>
    </div>
    <ClockWidget className="text-neutral3" showIcon />
  </div>
);

export const WeatherScreen = ({ onBack, timeOfDay, isNight }) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);

  return (
    <div className={`flex flex-col min-h-[100dvh] min-h-screen ${theme.pageBg} pb-24`}>
      <ScreenHeader title="Weather Alert" onBack={onBack} theme={theme} />
      <div className="px-4 pt-4 space-y-4">
        <div className={`${theme.cardBg} rounded-2xl p-5 border ${theme.border} text-center shadow-sm`}>
          <CloudRain className="w-14 h-14 mx-auto text-purplePrimary mb-2" strokeWidth={1.5} />
          <h2 className={`text-subtitle ${theme.textPrimary}`}>Monsoon Heavy Rain</h2>
          <p className={`flex items-center justify-center gap-1 text-secondaryText ${theme.textMuted} mt-1`}>
            <MapPin className="w-4 h-4" /> Kandy District
          </p>
          <div className="grid grid-cols-2 gap-3 mt-5">
            {[
              { icon: Thermometer, value: "24°C", label: "Temperature" },
              { icon: Droplets, value: "95%", label: "Humidity" },
              { icon: Wind, value: "45 km/h", label: "Wind Speed" },
              { icon: Eye, value: "2 km", label: "Visibility" },
            ].map((d) => (
              <div key={d.label} className={`p-3 rounded-xl ${theme.cardBgAlt} flex items-center gap-2`}>
                <d.icon className="w-5 h-5 text-purplePrimary shrink-0" />
                <div className="text-left">
                  <h4 className={`text-paragraph ${theme.textPrimary}`}>{d.value}</h4>
                  <p className={`text-smallText ${theme.textMuted}`}>{d.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${theme.alertBg}`}>
          <h4 className="text-paragraph text-blackCustom flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Safety Advisory
          </h4>
          <p className="text-secondaryText text-gray6 mt-1.5">
            Reduced speed advised on Route A9. Avoid unnecessary travel. Keep headlights on and maintain safe distance.
          </p>
        </div>

        <div className={`${theme.cardBg} rounded-2xl p-4 border ${theme.border}`}>
          <h4 className={`text-paragraph ${theme.textPrimary} mb-3`}>Affected Route</h4>
          {[
            { name: "Route A9", status: "Heavy Rain", warn: true },
            { name: "Route A – Kandy City", status: "Caution", warn: true },
          ].map((r) => (
            <div key={r.name} className="flex items-center justify-between py-2 border-b border-gray3 last:border-0">
              <span className={`text-secondaryText ${theme.textSecondary}`}>{r.name}</span>
              <span className={`text-smallText px-2 py-0.5 rounded-full ${theme.warning}`}>{r.status}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onBack}
          className={`w-full py-3.5 rounded-2xl ${theme.accent} font-medium text-paragraph`}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export const ShiftScreen = ({ onBack, timeOfDay, isNight }) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);

  return (
    <div className={`flex flex-col min-h-[100dvh] min-h-screen ${theme.pageBg} pb-24`}>
      <ScreenHeader title="Shift Information" onBack={onBack} theme={theme} />
      <div className="px-4 pt-4 space-y-4">
        <div className={`${theme.cardBg} rounded-2xl p-4 border ${theme.border}`}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-purplePrimary" />
            <h4 className={`text-paragraph ${theme.textPrimary}`}>Today&apos;s Shift</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className={`text-smallText ${theme.textMuted}`}>Start</p>
              <p className={`text-heading ${theme.textPrimary}`}>07:00 AM</p>
            </div>
            <div>
              <p className={`text-smallText ${theme.textMuted}`}>End</p>
              <p className={`text-heading ${theme.textPrimary}`}>06:00 PM</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[
            { value: "18.2 km", label: "Distance", icon: MapPin },
            { value: "3 / 8", label: "Deliveries", icon: Package },
            { value: "12.4 L", label: "Fuel Used", icon: Fuel },
          ].map((s) => (
            <div key={s.label} className={`${theme.cardBg} rounded-2xl p-3 text-center border ${theme.border}`}>
              <s.icon className="w-5 h-5 mx-auto text-purplePrimary mb-1" />
              <h3 className={`text-paragraph ${theme.textPrimary}`}>{s.value}</h3>
              <p className={`text-smallText ${theme.textMuted}`}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className={`flex items-start gap-2 p-3.5 rounded-xl ${theme.cardBgAlt}`}>
          <AlertTriangle className="w-5 h-5 text-purplePrimary shrink-0 mt-0.5" strokeWidth={2} />
          <p className={`text-secondaryText ${theme.textSecondary}`}>
            You have 5 stops remaining. Keep going!
          </p>
        </div>
      </div>
    </div>
  );
};

export const OfflineScreen = ({ onContinue, timeOfDay, isNight }) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);

  return (
    <div className={`flex flex-col min-h-[100dvh] min-h-screen ${theme.pageBg} pb-24 items-center justify-center px-6 text-center`}>
      <WifiOff className="w-16 h-16 text-purplePrimary mb-4" strokeWidth={1.5} />
      <h1 className={`text-subtitle ${theme.textPrimary}`}>Offline Mode</h1>
      <p className={`text-secondaryText ${theme.textMuted} mt-2 max-w-xs`}>
        You are currently offline. Maps and live updates will sync once you&apos;re back online.
      </p>
      <div className={`mt-6 flex items-center gap-3 p-4 rounded-2xl ${theme.cardBg} border ${theme.border} w-full max-w-sm text-left`}>
        <div className="w-9 h-9 rounded-full bg-secondaryGreen flex items-center justify-center shrink-0">
          <Check className="w-5 h-5 text-blackCustom" strokeWidth={2.5} />
        </div>
        <div>
          <h4 className={`text-paragraph ${theme.textPrimary}`}>7 items saved</h4>
          <p className={`text-smallText ${theme.textMuted}`}>They will sync automatically.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onContinue}
        className={`mt-6 w-full max-w-sm py-3.5 rounded-2xl ${theme.accent} font-medium text-paragraph`}
      >
        Continue Offline
      </button>
    </div>
  );
};

export const MyProfileScreen = ({ driver, onBack, timeOfDay, isNight }) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);
  const d = driver || { name: "Kasun Perera", phone: "0771234567", email: "kasun@waypoint.lk", id: "DLV-0123" };

  return (
    <div className={`flex flex-col min-h-[100dvh] min-h-screen ${theme.pageBg} pb-24`}>
      <ScreenHeader title="My Profile" onBack={onBack} theme={theme} />
      <div className="px-4 pt-4 space-y-3">
        {[
          { icon: User, label: "Full Name", value: d.name },
          { icon: Phone, label: "Phone", value: d.phone },
          { icon: Mail, label: "Email", value: d.email },
          { icon: CreditCard, label: "Driver ID", value: d.id },
        ].map((row) => (
          <div key={row.label} className={`flex items-center gap-3 p-4 rounded-2xl ${theme.cardBg} border ${theme.border}`}>
            <row.icon className="w-5 h-5 text-purplePrimary shrink-0" />
            <div>
              <p className={`text-smallText ${theme.textMuted}`}>{row.label}</p>
              <p className={`text-paragraph ${theme.textPrimary}`}>{row.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const VehicleScreen = ({ onBack, timeOfDay, isNight }) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);

  return (
    <div className={`flex flex-col min-h-[100dvh] min-h-screen ${theme.pageBg} pb-24`}>
      <ScreenHeader title="Vehicle Details" onBack={onBack} theme={theme} />
      <div className="px-4 pt-4 space-y-3">
        <div className={`${theme.cardBg} rounded-2xl p-5 border ${theme.border} text-center`}>
          <Truck className="w-12 h-12 mx-auto text-purplePrimary mb-2" strokeWidth={1.5} />
          <h3 className={`text-heading ${theme.textPrimary}`}>Toyota HiAce</h3>
          <p className={`text-secondaryText ${theme.textMuted}`}>Van • WP CAB-4521</p>
        </div>
        {[
          { label: "Registration", value: "WP CAB-4521" },
          { label: "Capacity", value: "1,200 kg" },
          { label: "Fuel Type", value: "Diesel" },
          { label: "Last Service", value: "12 Aug 2026" },
        ].map((r) => (
          <div key={r.label} className={`flex justify-between p-4 rounded-2xl ${theme.cardBg} border ${theme.border}`}>
            <span className={`text-secondaryText ${theme.textMuted}`}>{r.label}</span>
            <span className={`text-paragraph ${theme.textPrimary}`}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LicenseScreen = ({ onBack, timeOfDay, isNight }) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);

  return (
    <div className={`flex flex-col min-h-[100dvh] min-h-screen ${theme.pageBg} pb-24`}>
      <ScreenHeader title="Driving License" onBack={onBack} theme={theme} />
      <div className="px-4 pt-4 space-y-3">
        <div className={`${theme.cardBg} rounded-2xl p-5 border ${theme.border}`}>
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-8 h-8 text-purplePrimary" />
            <div>
              <h3 className={`text-heading ${theme.textPrimary}`}>Class B License</h3>
              <p className={`text-secondaryText ${theme.textMuted}`}>Valid</p>
            </div>
          </div>
          {[
            { label: "License No.", value: "B12345678" },
            { label: "Issued", value: "15 Mar 2020" },
            { label: "Expires", value: "14 Mar 2028" },
            { label: "Categories", value: "B, C1" },
          ].map((r) => (
            <div key={r.label} className="flex justify-between py-2 border-t border-gray3 first:border-0">
              <span className={`text-secondaryText ${theme.textMuted}`}>{r.label}</span>
              <span className={`text-paragraph ${theme.textPrimary}`}>{r.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LanguageScreen = ({ onBack, current = "en", onChange, timeOfDay, isNight }) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);
  const langs = [
    { code: "en", label: "English" },
    { code: "si", label: "සිංහල (Sinhala)" },
    { code: "ta", label: "தமிழ் (Tamil)" },
  ];

  return (
    <div className={`flex flex-col min-h-[100dvh] min-h-screen ${theme.pageBg} pb-24`}>
      <ScreenHeader title="Language" onBack={onBack} theme={theme} />
      <div className="px-4 pt-4 space-y-2">
        {langs.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => onChange?.(l.code)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border ${theme.border} ${
              current === l.code ? "bg-neutral1 border-purplePrimary" : theme.cardBg
            }`}
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-purplePrimary" />
              <span className={`text-paragraph ${theme.textPrimary}`}>{l.label}</span>
            </div>
            {current === l.code && <Check className="w-5 h-5 text-purplePrimary" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export const DeliveryCompletedScreen = ({ onContinue, timeOfDay, isNight }) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);

  return (
    <div className={`flex flex-col min-h-[100dvh] min-h-screen ${theme.pageBg} items-center justify-center px-6 text-center pb-24`}>
      <div className="w-20 h-20 rounded-full bg-secondaryGreen flex items-center justify-center mb-4">
        <Check className="w-10 h-10 text-blackCustom" strokeWidth={2.5} />
      </div>
      <h1 className={`text-subtitle ${theme.textPrimary}`}>Delivery Completed</h1>
      <p className={`text-secondaryText ${theme.textMuted} mt-2`}>
        Great job! This stop has been marked as delivered.
      </p>
      <button
        type="button"
        onClick={onContinue}
        className={`mt-8 w-full max-w-sm py-3.5 rounded-2xl ${theme.accent} font-medium text-paragraph`}
      >
        Continue to Next Stop
      </button>
    </div>
  );
};
