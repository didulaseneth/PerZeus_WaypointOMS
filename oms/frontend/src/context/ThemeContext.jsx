import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext();

/**
 * Time-based theme windows (local time):
 *   Morning  : 05:00 – 11:59  → bright, clean light theme
 *   Evening  : 12:00 – 17:59  → soft warm dusk theme
 *   Night    : 18:00 – 04:59  → deep dark night theme
 */
export function getTimeBasedTheme(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "evening";
  return "night";
}

const VALID_MODES = ["morning", "evening", "night", "auto"];

function applyThemeToDocument(theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "theme-morning", "theme-evening", "theme-night");
  root.removeAttribute("data-theme");

  root.setAttribute("data-theme", theme);
  root.classList.add(`theme-${theme}`);

  if (theme === "evening" || theme === "night") {
    root.classList.add("dark");
  }
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => {
    const stored = localStorage.getItem("wp_theme_preference");
    return VALID_MODES.includes(stored) ? stored : "auto";
  });

  const [mode, setMode] = useState(() => {
    const stored = localStorage.getItem("wp_theme_preference");
    if (stored && stored !== "auto" && VALID_MODES.includes(stored)) {
      return stored;
    }
    return getTimeBasedTheme();
  });

  const [cutoffTime, setCutoffTime] = useState("");

  const resolveTheme = useCallback(() => {
    if (preference === "auto") return getTimeBasedTheme();
    return preference;
  }, [preference]);

  useEffect(() => {
    const tick = () => {
      const next = resolveTheme();
      setMode((prev) => (prev !== next ? next : prev));
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [resolveTheme]);

  useEffect(() => {
    applyThemeToDocument(mode);
  }, [mode]);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(16, 0, 0, 0);

      let diff = cutoff.getTime() - now.getTime();
      if (diff < 0) {
        cutoff.setDate(cutoff.getDate() + 1);
        diff = cutoff.getTime() - now.getTime();
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCutoffTime(`${h}h ${m}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  /** Cycle: auto → morning → evening → night → auto */
  const toggleTheme = () => {
    const order = ["auto", "morning", "evening", "night"];
    const idx = order.indexOf(preference);
    const next = order[(idx + 1) % order.length];
    setPreference(next);
    localStorage.setItem("wp_theme_preference", next);
    if (next !== "auto") {
      setMode(next);
    } else {
      setMode(getTimeBasedTheme());
    }
  };

  const setTheme = (value) => {
    if (!VALID_MODES.includes(value)) return;
    setPreference(value);
    localStorage.setItem("wp_theme_preference", value);
    setMode(value === "auto" ? getTimeBasedTheme() : value);
  };

  return (
    <ThemeContext.Provider
      value={{
        mode,
        preference,
        toggleTheme,
        setTheme,
        cutoffTime,
        isAuto: preference === "auto",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
