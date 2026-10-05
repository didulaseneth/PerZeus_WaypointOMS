/**
 * Time utilities for Driver screens
 * - Real-time clock helpers
 * - Time-of-day theming: morning | evening | night
 * - Greeting based on hour
 */

/**
 * Returns the current time-of-day period.
 * - morning: 05:00 – 11:59  (fresh, bright light theme)
 * - evening: 12:00 – 18:59  (warm, softer light theme)
 * - night:   19:00 – 04:59  (soft dark theme)
 */
export const getTimeOfDay = (date = new Date()) => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 19) return "evening";
  return "night";
};

/**
 * Returns true if current time is considered "night" (19:00 – 04:59).
 * Kept for backward compatibility with components that still pass isNight.
 */
export const isNightTime = (date = new Date()) => {
  return getTimeOfDay(date) === "night";
};

/**
 * Returns a greeting string based on the hour of day.
 */
export const getGreeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";
  return "Good Night";
};

/**
 * Formats time as HH:MM:SS (24h) or locale string.
 */
export const formatTime = (date = new Date(), options = {}) => {
  const {
    hour12 = false,
    showSeconds = true,
  } = options;

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    hour12,
  });
};

/**
 * Formats date as e.g. "Wed, 26 Aug"
 */
export const formatDateShort = (date = new Date()) => {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

/**
 * Normalize a theme key: accepts "morning"|"evening"|"night"
 * or legacy boolean (true → night, false → morning).
 */
const normalizePeriod = (periodOrIsNight) => {
  if (periodOrIsNight === true || periodOrIsNight === "night") return "night";
  if (periodOrIsNight === "evening") return "evening";
  // false, "morning", null, undefined → morning (bright default)
  return "morning";
};

/**
 * Returns Tailwind class sets for morning / evening / night themes.
 * Uses ONLY brand colors from tailwind.config.js (plus a few evening helpers).
 *
 * @param {boolean|string} periodOrIsNight - "morning"|"evening"|"night" or legacy boolean
 */
export const getThemeClasses = (periodOrIsNight) => {
  const period = normalizePeriod(periodOrIsNight);

  if (period === "night") {
    return {
      period: "night",
      pageBg: "bg-dark900",
      cardBg: "bg-dark800",
      cardBgAlt: "bg-dark700",
      statCard: "bg-dark800",
      textPrimary: "text-darkText1",
      textSecondary: "text-darkText2",
      textMuted: "text-darkText3",
      border: "border-dark600",
      inputBorder: "border-dark600",
      inputBg: "bg-dark800",
      headerBg: "bg-dark900",
      navBg: "bg-dark800",
      navActive: "text-purplePrimary",
      navInactive: "text-darkText3",
      accent: "bg-purplePrimary text-whiteCustom",
      accentOutline: "border-purplePrimary text-purplePrimary",
      success: "bg-secondaryGreen/20 text-secondaryGreen",
      warning: "bg-secondaryYellow/20 text-secondaryYellow",
      danger: "bg-secondaryPink/20 text-secondaryPink",
      alertBg: "bg-secondaryYellow/10 border-secondaryYellow/40",
      // Extra helpers
      headerText: "text-whiteCustom",
      headerSubtext: "text-darkText2",
      isDark: true,
      shadow: "shadow-card-night",
    };
  }

  if (period === "evening") {
    // Warm, softer light theme — suitable for afternoon / dusk
    return {
      period: "evening",
      pageBg: "bg-eveningBg",
      cardBg: "bg-eveningCard",
      cardBgAlt: "bg-eveningCardAlt",
      statCard: "bg-eveningCard",
      textPrimary: "text-eveningText",
      textSecondary: "text-eveningTextSecondary",
      textMuted: "text-eveningTextMuted",
      border: "border-eveningBorder",
      inputBorder: "border-eveningBorder",
      inputBg: "bg-eveningCard",
      headerBg: "bg-eveningHeader",
      navBg: "bg-eveningCard",
      navActive: "text-purplePrimary",
      navInactive: "text-eveningTextMuted",
      accent: "bg-purplePrimary text-whiteCustom",
      accentOutline: "border-purplePrimary text-purplePrimary",
      success: "bg-secondaryGreen text-blackCustom",
      warning: "bg-secondaryYellow text-blackCustom",
      danger: "bg-secondaryPink text-blackCustom",
      alertBg: "bg-secondaryYellow/30 border-secondaryYellow",
      headerText: "text-whiteCustom",
      headerSubtext: "text-neutral3",
      isDark: false,
      shadow: "shadow-card",
    };
  }

  // Morning — bright, fresh light theme
  return {
    period: "morning",
    pageBg: "bg-gray1",
    cardBg: "bg-whiteCustom",
    cardBgAlt: "bg-gray2",
    textPrimary: "text-blackCustom",
    textSecondary: "text-gray6",
    textMuted: "text-gray5",
    border: "border-gray3",
    inputBg: "bg-whiteCustom",
    inputBorder: "border-gray3",
    headerBg: "bg-blackCustom",
    navBg: "bg-whiteCustom",
    navActive: "text-purplePrimary",
    navInactive: "text-gray5",
    accent: "bg-purplePrimary text-whiteCustom",
    accentOutline: "border-purplePrimary text-purplePrimary",
    success: "bg-secondaryGreen text-blackCustom",
    warning: "bg-secondaryYellow text-blackCustom",
    danger: "bg-secondaryPink text-blackCustom",
    statCard: "bg-whiteCustom",
    alertBg: "bg-secondaryYellow/30 border-secondaryYellow",
    headerText: "text-whiteCustom",
    headerSubtext: "text-neutral3",
    isDark: false,
    shadow: "shadow-card",
  };
};
