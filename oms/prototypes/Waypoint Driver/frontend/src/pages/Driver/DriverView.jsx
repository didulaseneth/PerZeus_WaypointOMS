import { useState, useCallback, useEffect } from "react";
import BottomNav from "../../components/Driver/BottomNav";
import UserProfile from "../../components/Driver/UserProfile";
import DashboardScreen from "../../components/Driver/DashboardScreen";
import NavigationScreen from "../../components/Driver/NavigationScreen";
import StopDetailsScreen from "../../components/Driver/StopDetailsScreen";
import InboxScreen from "../../components/Driver/InboxScreen";
import {
  LoginScreen,
  CreateAccountScreen,
  ForgotPasswordScreen,
  OTPScreen,
} from "../../components/Driver/AuthScreens";
import {
  WeatherScreen,
  ShiftScreen,
  OfflineScreen,
  MyProfileScreen,
  VehicleScreen,
  LicenseScreen,
  LanguageScreen,
  DeliveryCompletedScreen,
} from "../../components/Driver/SecondaryScreens";
import { getTimeOfDay, getThemeClasses } from "../../utils/time";

/**
 * Main Driver role entry point.
 * Manages internal screen state (auth + app screens).
 * Time-based theming: morning | evening | night via getThemeClasses / getTimeOfDay.
 */

const DRIVER = {
  name: "Kasun Perera",
  initials: "KP",
  role: "Driver",
  id: "DLV-0123",
  phone: "0771234567",
  email: "kasun@waypoint.lk",
};

// Screens that show the bottom nav
const NAV_SCREENS = new Set([
  "dashboard",
  "navigation",
  "stops",
  "inbox",
  "profile",
]);

const PERIODS = ["morning", "evening", "night"];

const DriverView = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState("login"); // login | create | forgot | otp
  const [screen, setScreen] = useState("dashboard");
  const [isOffline, setIsOffline] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2026-08-26");
  const [language, setLanguage] = useState("en");
  const [themeTick, setThemeTick] = useState(0); // force re-render on period change
  // null = auto (time-based), or forced "morning" | "evening" | "night"
  const [themeOverride, setThemeOverride] = useState(null);

  // Re-evaluate auto theme periodically (every minute is enough for period switch)
  useEffect(() => {
    const id = setInterval(() => setThemeTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // Effective period: manual override wins over auto-detection
  const autoPeriod = getTimeOfDay();
  const timeOfDay = themeOverride || autoPeriod;
  const isNight = timeOfDay === "night";
  const theme = getThemeClasses(timeOfDay);
  // themeTick used to ensure re-render on hour change; suppress lint
  void themeTick;

  const handleThemeToggle = useCallback(() => {
    setThemeOverride((prev) => {
      // Cycle: auto → next period after current auto → next → next → back to auto
      if (prev === null) {
        // Start forced cycle from the period after the auto one
        const idx = PERIODS.indexOf(autoPeriod);
        return PERIODS[(idx + 1) % PERIODS.length];
      }
      const idx = PERIODS.indexOf(prev);
      if (idx === PERIODS.length - 1) return null; // last → auto
      return PERIODS[idx + 1];
    });
  }, [autoPeriod]);

  const go = useCallback((id) => setScreen(id), []);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
    setScreen("dashboard");
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setAuthScreen("login");
  }, []);

  // ——— Auth flow ———
  if (!isAuthenticated) {
    if (authScreen === "create") {
      return (
        <CreateAccountScreen
          onSubmit={() => {
            setIsAuthenticated(true);
            setScreen("dashboard");
          }}
          onBack={() => setAuthScreen("login")}
        />
      );
    }
    if (authScreen === "forgot") {
      return (
        <ForgotPasswordScreen
          onSubmit={() => setAuthScreen("otp")}
          onBack={() => setAuthScreen("login")}
        />
      );
    }
    if (authScreen === "otp") {
      return (
        <OTPScreen
          phoneDisplay={DRIVER.phone}
          onVerify={() => {
            setIsAuthenticated(true);
            setScreen("dashboard");
          }}
          onResend={() => {}}
          onBack={() => setAuthScreen("forgot")}
        />
      );
    }
    return (
      <LoginScreen
        onLogin={handleLogin}
        onCreateAccount={() => setAuthScreen("create")}
        onForgotPassword={() => setAuthScreen("forgot")}
      />
    );
  }

  // ——— Main app screens ———
  const showNav = NAV_SCREENS.has(screen);

  const renderScreen = () => {
    switch (screen) {
      case "dashboard":
        return (
          <DashboardScreen
            driver={DRIVER}
            isOffline={isOffline}
            onGoOnline={() => setIsOffline(false)}
            onNavigate={go}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            timeOfDay={timeOfDay}
            isNight={isNight}
            themeOverride={themeOverride}
            onThemeToggle={handleThemeToggle}
          />
        );
      case "navigation":
        return (
          <NavigationScreen
            onNavigateToStop={() => go("stops")}
            timeOfDay={timeOfDay}
            isNight={isNight}
          />
        );
      case "stops":
        return (
          <StopDetailsScreen
            onMarkArrived={() => go("delivery-completed")}
            timeOfDay={timeOfDay}
            isNight={isNight}
          />
        );
      case "inbox":
        return <InboxScreen timeOfDay={timeOfDay} isNight={isNight} />;
      case "profile":
        return (
          <UserProfile
            driver={DRIVER}
            onNavigate={go}
            onLogout={handleLogout}
            timeOfDay={timeOfDay}
            isNight={isNight}
          />
        );
      case "weather":
        return <WeatherScreen onBack={() => go("dashboard")} />;
      case "shift":
        return <ShiftScreen onBack={() => go("profile")} />;
      case "offline":
        return (
          <OfflineScreen
            onContinue={() => {
              setIsOffline(true);
              go("dashboard");
            }}
          />
        );
      case "my-profile":
        return <MyProfileScreen driver={DRIVER} onBack={() => go("profile")} />;
      case "vehicle":
        return <VehicleScreen onBack={() => go("profile")} />;
      case "license":
        return <LicenseScreen onBack={() => go("profile")} />;
      case "language":
        return (
          <LanguageScreen
            current={language}
            onChange={setLanguage}
            onBack={() => go("profile")}
          />
        );
      case "delivery-completed":
        return (
          <DeliveryCompletedScreen onContinue={() => go("navigation")} />
        );
      default:
        return (
          <DashboardScreen
            driver={DRIVER}
            isOffline={isOffline}
            onGoOnline={() => setIsOffline(false)}
            onNavigate={go}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            timeOfDay={timeOfDay}
            isNight={isNight}
            themeOverride={themeOverride}
            onThemeToggle={handleThemeToggle}
          />
        );
    }
  };

  return (
    <div
      className={`min-h-screen max-w-md mx-auto relative ${theme.pageBg} transition-colors duration-500`}
    >
      {renderScreen()}
      {showNav && (
        <BottomNav
          activeScreen={screen}
          onNavigate={go}
          timeOfDay={timeOfDay}
          isNight={isNight}
        />
      )}
    </div>
  );
};

export default DriverView;
