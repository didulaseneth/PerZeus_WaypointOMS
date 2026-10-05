import { useState, useCallback, useEffect } from "react";
import BottomNav from "../../components/Driver/BottomNav";
import UserProfile from "../../components/Driver/UserProfile";
import DashboardScreen from "../../components/Driver/DashboardScreen";
import NavigationScreen from "../../components/Driver/NavigationScreen";
import StopsListScreen from "../../components/Driver/StopsListScreen";
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
import { DEMO_DESTINATION } from "../../utils/location";

/**
 * Main Driver role entry point.
 * Screens: auth → dashboard | navigation | stops list | stop details | inbox | profile + secondary.
 */

const DRIVER = {
  name: "Kasun Perera",
  initials: "KP",
  role: "Driver",
  id: "DLV-0123",
  phone: "0771234567",
  email: "kasun@waypoint.lk",
};

const NAV_SCREENS = new Set([
  "dashboard",
  // "navigation" intentionally omitted — full-screen map has its own actions
  "stops",
  "inbox",
  "profile",
]);

const PERIODS = ["morning", "evening", "night"];

const DEFAULT_STOP_DETAIL = {
  number: 1,
  name: "Green Mart",
  address: "No.125, Peradeniya Road, Kandy",
  eta: "08:17 AM",
  distance: "2.3 km",
  status: "On Time",
  lat: DEMO_DESTINATION.lat,
  lng: DEMO_DESTINATION.lng,
  items: [
    { id: 1, name: "Fresh Groceries", detail: "12 items", count: 12, type: "produce" },
    { id: 2, name: "Chilled Products", detail: "4 items", count: 4, type: "chilled" },
    { id: 3, name: "Dry Goods", detail: "6 items", count: 6, type: "dry" },
  ],
  instructions:
    "Use back entrance. Contact store manager if the gate is closed.",
};

const DriverView = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState("login");
  const [screen, setScreen] = useState("dashboard");
  const [isOffline, setIsOffline] = useState(false);
  const [selectedDate, setSelectedDate] = useState("2026-08-26");
  const [language, setLanguage] = useState("en");
  const [themeTick, setThemeTick] = useState(0);
  const [themeOverride, setThemeOverride] = useState(null);
  const [activeStop, setActiveStop] = useState(DEFAULT_STOP_DETAIL);

  useEffect(() => {
    const id = setInterval(() => setThemeTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const autoPeriod = getTimeOfDay();
  const timeOfDay = themeOverride || autoPeriod;
  const isNight = timeOfDay === "night";
  const theme = getThemeClasses(timeOfDay);
  void themeTick;

  const handleThemeToggle = useCallback(() => {
    setThemeOverride((prev) => {
      if (prev === null) {
        const idx = PERIODS.indexOf(autoPeriod);
        return PERIODS[(idx + 1) % PERIODS.length];
      }
      const idx = PERIODS.indexOf(prev);
      if (idx === PERIODS.length - 1) return null;
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

  const handleSelectStop = useCallback((stop) => {
    setActiveStop({
      ...DEFAULT_STOP_DETAIL,
      number: stop.number ?? stop.id,
      name: stop.name,
      address: stop.address,
      eta: stop.eta,
      distance: stop.distance,
      status: stop.status === "Next" ? "On Time" : stop.status,
      // Keep demo coords unless stop provides its own
      lat: stop.lat ?? DEMO_DESTINATION.lat,
      lng: stop.lng ?? DEMO_DESTINATION.lng,
    });
    setScreen("stop-details");
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
            onBack={() => go("dashboard")}
            onCancelTrip={() => go("dashboard")}
            onArrived={() => {
              setActiveStop(DEFAULT_STOP_DETAIL);
              go("delivery-completed");
            }}
            onNavigateToStop={() => {
              setActiveStop(DEFAULT_STOP_DETAIL);
              go("stop-details");
            }}
            timeOfDay={timeOfDay}
            isNight={isNight}
          />
        );
      case "stops":
        return (
          <StopsListScreen
            onSelectStop={handleSelectStop}
            onNavigateToRoute={() => go("navigation")}
            timeOfDay={timeOfDay}
            isNight={isNight}
          />
        );
      case "stop-details":
        return (
          <StopDetailsScreen
            stop={activeStop}
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
        return (
          <WeatherScreen
            onBack={() => go("dashboard")}
            timeOfDay={timeOfDay}
            isNight={isNight}
          />
        );
      case "shift":
        return (
          <ShiftScreen
            onBack={() => go("profile")}
            timeOfDay={timeOfDay}
            isNight={isNight}
          />
        );
      case "offline":
        return (
          <OfflineScreen
            onContinue={() => {
              setIsOffline(true);
              go("dashboard");
            }}
            timeOfDay={timeOfDay}
            isNight={isNight}
          />
        );
      case "my-profile":
        return (
          <MyProfileScreen
            driver={DRIVER}
            onBack={() => go("profile")}
            timeOfDay={timeOfDay}
            isNight={isNight}
          />
        );
      case "vehicle":
        return (
          <VehicleScreen
            onBack={() => go("profile")}
            timeOfDay={timeOfDay}
            isNight={isNight}
          />
        );
      case "license":
        return (
          <LicenseScreen
            onBack={() => go("profile")}
            timeOfDay={timeOfDay}
            isNight={isNight}
          />
        );
      case "language":
        return (
          <LanguageScreen
            current={language}
            onChange={setLanguage}
            onBack={() => go("profile")}
            timeOfDay={timeOfDay}
            isNight={isNight}
          />
        );
      case "delivery-completed":
        return (
          <DeliveryCompletedScreen
            onContinue={() => go("stops")}
            timeOfDay={timeOfDay}
            isNight={isNight}
          />
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
      className={`min-h-[100dvh] min-h-screen max-w-md mx-auto relative ${theme.pageBg} transition-colors duration-500`}
    >
      {renderScreen()}
      {showNav && (
        <BottomNav
          activeScreen={screen === "stop-details" ? "stops" : screen}
          onNavigate={go}
          timeOfDay={timeOfDay}
          isNight={isNight}
        />
      )}
    </div>
  );
};

export default DriverView;
