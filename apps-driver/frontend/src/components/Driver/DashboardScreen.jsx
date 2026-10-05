import { useMemo } from "react";
import {
  MapPin,
  AlertTriangle,
  ChevronRight,
  CloudRain,
  CheckCircle2,
  Circle,
  TrendingUp,
  Zap,
  Sun,
  Moon,
  Sunset,
} from "lucide-react";
import Clock from "./Clock";
import OfflineBanner from "./OfflineBanner";
import logoSrc from "../../assets/logo.png";
import {
  getGreeting,
  getThemeClasses,
  getTimeOfDay,
} from "../../utils/time";

/**
 * Driver Dashboard (Home) screen — premium redesign with time-of-day theming.
 *
 * Themes:
 *  - Morning: bright, fresh light
 *  - Evening: warm cream / dusk light
 *  - Night: soft dark navy
 *
 * Manual Theme Toggle cycles: auto → morning → evening → night → auto
 */
const DashboardScreen = ({
  driver = { name: "Kasun Perera", id: "DLV-0123" },
  stats = { stops: 8, completed: 3, remaining: 5 },
  isOffline = false,
  onGoOnline,
  onNavigate,
  selectedDate,
  onSelectDate,
  timeOfDay,
  isNight,
  themeOverride,
  onThemeToggle,
}) => {
  const period = timeOfDay || (isNight ? "night" : getTimeOfDay());
  const theme = getThemeClasses(period);
  const effectiveIsNight = theme.isDark;
  const greeting = getGreeting();

  const firstName = driver.name.split(" ")[0];
  const initials = driver.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const completionPct =
    stats.stops > 0
      ? Math.round((stats.completed / stats.stops) * 100)
      : 0;

  // Calendar: 7-day row anchored at Aug 24 2026 (demo data)
  const calendarDays = useMemo(() => {
    const base = new Date(2026, 7, 24);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return {
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        day: d.getDate(),
      };
    });
  }, []);

  const activeDate = selectedDate || "2026-08-26";

  // ── Stop list (demo) ──────────────────────────────────────────────────────
  const stops = [
    { id: 1, label: "Kandy City Market", eta: "09:15 AM", done: true },
    { id: 2, label: "Peradeniya Depot", eta: "10:45 AM", done: false },
    { id: 3, label: "Getambe Warehouse", eta: "12:00 PM", done: false },
  ];

  // ── Stat card config ─────────────────────────────────────────────────────
  const statCards = [
    {
      value: stats.stops,
      label: "Total\nStops",
      accent: "bg-purplePrimary",
      textAccent: "text-purplePrimary",
      icon: Zap,
    },
    {
      value: stats.completed,
      label: "Done",
      accent: "bg-secondaryGreen",
      textAccent: "text-secondaryGreen",
      icon: CheckCircle2,
    },
    {
      value: stats.remaining,
      label: "Left",
      accent: "bg-secondaryYellow",
      textAccent: "text-secondaryYellow",
      icon: TrendingUp,
    },
  ];

  return (
    <div className={`flex flex-col min-h-[100dvh] min-h-screen ${theme.pageBg} pb-28 transition-colors duration-300`}>
      <OfflineBanner isOffline={isOffline} onGoOnline={onGoOnline} />

      {/* ════════════════════════════════════════════
          HERO HEADER  — themed by time of day
      ════════════════════════════════════════════ */}
      <div
        className={`relative ${theme.headerBg} px-5 pt-5 pb-10 rounded-b-[32px] overflow-hidden transition-colors duration-300 ${
          effectiveIsNight ? "border-b border-dark600/70" : ""
        }`}
      >
        {/* Subtle decorative glow blobs — using brand colours only */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-purplePrimary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -left-6 w-32 h-32 bg-neutral5/10 rounded-full blur-2xl pointer-events-none" />
        {period === "evening" && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-secondaryYellow/10 rounded-full blur-3xl pointer-events-none" />
        )}

        {/* ─── Brand bar: logo + company name + Clock & Theme Toggle ─── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <img
              src={logoSrc}
              alt="Waypoint Group Logo"
              className="h-8 w-8 object-contain rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <span className="text-whiteCustom text-[15px] font-bold tracking-wide leading-none">
              Waypoint Group
            </span>
          </div>

          {/* Clock & Manual Theme Toggle */}
          <div className="flex items-center gap-2">
            {/* Live clock widget */}
            <Clock variant="compact" />

            {/* Theme Toggle — cycles morning → evening → night → auto */}
            {onThemeToggle && (
              <button
                type="button"
                onClick={onThemeToggle}
                aria-label={`Current theme: ${period}${themeOverride ? " (manual)" : " (auto)"}. Click to change.`}
                title={
                  themeOverride
                    ? `${period.charAt(0).toUpperCase() + period.slice(1)} mode (manual) — click to cycle`
                    : `${period.charAt(0).toUpperCase() + period.slice(1)} mode (auto) — click to cycle`
                }
                className="flex items-center justify-center w-8 h-8 rounded-xl bg-whiteCustom/10 hover:bg-whiteCustom/20 border border-whiteCustom/15 text-whiteCustom backdrop-blur-md transition-all active:scale-90 shadow-sm"
              >
                {period === "night" ? (
                  <Moon className="w-4 h-4 text-neutral2 transition-transform -rotate-12 hover:rotate-0" />
                ) : period === "evening" ? (
                  <Sunset className="w-4 h-4 text-secondaryYellow transition-transform hover:scale-110" />
                ) : (
                  <Sun className="w-4 h-4 text-secondaryYellow transition-transform hover:rotate-45" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* ─── Greeting row ─── */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-2xl bg-purplePrimary flex items-center justify-center shrink-0 shadow-card-lg">
            <span className="text-whiteCustom text-paragraph font-extrabold">
              {initials}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-neutral4 text-smallText font-semibold tracking-wider uppercase">
              {greeting}
            </p>
            <h1 className="text-whiteCustom text-heading font-black font-sans leading-tight truncate mt-0.5">
              {firstName}!
            </h1>
            <p className="text-neutral3 text-smallText mt-0.5">
              {driver.id} &nbsp;·&nbsp; Driver
            </p>
          </div>
        </div>

        {/* ─── Progress bar (completion) ─── */}
        <div className="mt-5 glass-card rounded-2xl px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral3 text-smallText font-semibold tracking-wide uppercase">
              Route Progress
            </span>
            <span className="text-whiteCustom text-smallText font-bold">
              {completionPct}%
            </span>
          </div>
          {/* Track */}
          <div className="h-2 rounded-full bg-whiteCustom/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-purplePrimary transition-all duration-700"
              style={{ width: `${completionPct}%` }}
              role="progressbar"
              aria-valuenow={completionPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p className="text-neutral4 text-smallText mt-2">
            {stats.completed} of {stats.stops} stops completed
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          STAT CARDS — float up over the header
      ════════════════════════════════════════════ */}
      <div className="px-4 -mt-5">
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`${theme.cardBg} rounded-2xl px-3 pt-3 pb-3.5 shadow-card border ${theme.border} flex flex-col gap-1 relative overflow-hidden transition-colors duration-300`}
              >
                {/* Accent strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${s.accent} rounded-t-2xl`} />
                <Icon className={`w-4 h-4 ${s.textAccent} mt-1`} strokeWidth={2.5} />
                <span className={`text-subtitle ${theme.textPrimary} font-black leading-none mt-1`}>
                  {s.value}
                </span>
                <span className={`text-smallText ${theme.textMuted} leading-tight`}>
                  {s.label.replace("\\n", " ")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          WEATHER ALERT
      ════════════════════════════════════════════ */}
      <button
        type="button"
        onClick={() => onNavigate("weather")}
        className={`mx-4 mt-5 flex items-start gap-3 p-4 rounded-2xl border text-left active:scale-[0.98] transition-all shadow-card ${theme.alertBg} ${theme.cardBg}`}
      >
        <div className="w-9 h-9 rounded-xl bg-secondaryYellow flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4.5 h-4.5 text-blackCustom" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <strong className={`text-paragraph font-bold ${theme.textPrimary}`}>
            Monsoon Heavy Rain Alert
          </strong>
          <p className={`text-secondaryText ${theme.textSecondary} mt-0.5 leading-snug`}>
            Kandy District — Reduced speed advised on Route A9.
          </p>
        </div>
        <ChevronRight className={`w-4 h-4 ${theme.textMuted} mt-1 shrink-0`} />
      </button>

      {/* ════════════════════════════════════════════
          TODAY'S ROUTE CARD
      ════════════════════════════════════════════ */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-heading ${theme.textPrimary}`}>
            Today&apos;s Route
          </h2>
          <button
            type="button"
            onClick={() => onNavigate("navigation")}
            className="text-secondaryText text-purplePrimary font-semibold flex items-center gap-0.5 hover:underline"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Route summary card */}
        <button
          type="button"
          onClick={() => onNavigate("navigation")}
          className={`w-full flex items-center gap-3.5 p-4 rounded-2xl ${theme.cardBg} border ${theme.border} shadow-card text-left active:scale-[0.99] transition-all`}
        >
          <div className={`w-11 h-11 rounded-xl ${theme.cardBgAlt} flex items-center justify-center shrink-0`}>
            <MapPin className="w-5 h-5 text-purplePrimary" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-paragraph font-bold ${theme.textPrimary}`}>
              Route A – Kandy City
            </h3>
            <p className={`text-secondaryText ${theme.textMuted} mt-0.5`}>
              5 stops &nbsp;·&nbsp; 18.2 km &nbsp;·&nbsp; ETA 10:15 AM
            </p>
          </div>
          <span className={`badge-pill shrink-0 ${theme.success}`}>
            Active
          </span>
        </button>
      </div>

      {/* ════════════════════════════════════════════
          STOP LIST PREVIEW
      ════════════════════════════════════════════ */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className={`text-heading ${theme.textPrimary}`}>Stops Preview</h2>
          <button
            type="button"
            onClick={() => onNavigate("stops")}
            className="text-secondaryText text-purplePrimary font-semibold flex items-center gap-0.5 hover:underline"
          >
            All Stops <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className={`${theme.cardBg} rounded-2xl border ${theme.border} shadow-card overflow-hidden transition-colors duration-300`}>
          {stops.map((stop, idx) => (
            <div key={stop.id}>
              <button
                type="button"
                onClick={() => onNavigate("stops")}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left transition-colors active:opacity-80 hover:opacity-90`}
              >
                {stop.done ? (
                  <CheckCircle2
                    className="w-5 h-5 text-purplePrimary shrink-0"
                    strokeWidth={2}
                  />
                ) : (
                  <Circle
                    className={`w-5 h-5 ${theme.textMuted} shrink-0`}
                    strokeWidth={1.5}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-paragraph font-semibold leading-tight ${
                      stop.done
                        ? `line-through ${theme.textMuted}`
                        : theme.textPrimary
                    }`}
                  >
                    {stop.label}
                  </p>
                  <p className={`text-smallText ${theme.textMuted} mt-0.5`}>
                    ETA {stop.eta}
                  </p>
                </div>
                <span
                  className={`badge-pill shrink-0 ${
                    stop.done
                      ? theme.success
                      : effectiveIsNight
                      ? "bg-purplePrimary/20 text-neutral3 border border-purplePrimary/30"
                      : period === "evening"
                      ? "bg-secondaryYellow/40 text-eveningText"
                      : "bg-neutral1 text-purplePrimary"
                  }`}
                >
                  {stop.done ? "Done" : "Pending"}
                </span>
              </button>
              {idx < stops.length - 1 && (
                <div className={`mx-4 border-t ${theme.border}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          CALENDAR WEEK ROW
      ════════════════════════════════════════════ */}
      <div className="px-4 mt-5">
        <h2 className={`text-heading ${theme.textPrimary} mb-3`}>
          Schedule
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {calendarDays.map((d) => {
            const active = d.date === activeDate;
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => onSelectDate?.(d.date)}
                className={`flex-shrink-0 w-14 py-3 rounded-2xl text-center transition-all duration-200 ${
                  active
                    ? "bg-purplePrimary shadow-card-lg scale-105"
                    : `${theme.cardBg} ${theme.textSecondary} border ${theme.border} shadow-card hover:border-purplePrimary`
                }`}
              >
                <span
                  className={`block text-smallText font-semibold tracking-wide ${
                    active ? "text-neutral3" : theme.textMuted
                  }`}
                >
                  {d.label}
                </span>
                <span
                  className={`block text-paragraph font-black mt-0.5 ${
                    active ? "text-whiteCustom" : theme.textPrimary
                  }`}
                >
                  {d.day}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          WEATHER HINT CHIP
      ════════════════════════════════════════════ */}
      <div className="px-4 mt-5 mb-2">
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl ${theme.cardBgAlt} border ${theme.border} shadow-card transition-colors duration-300`}
        >
          <div className={`w-8 h-8 rounded-xl ${theme.cardBg} border ${theme.border} flex items-center justify-center shrink-0`}>
            <CloudRain className="w-4 h-4 text-purplePrimary" strokeWidth={2} />
          </div>
          <p className={`text-secondaryText ${theme.textSecondary} flex-1`}>
            Expect heavy rain this afternoon — plan your stops accordingly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
