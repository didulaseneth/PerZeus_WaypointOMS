import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, DEMO_USERS, HOME } from "../auth";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutDashboard,
  Radio,
  Layers,
  Truck,
  BarChart3,
  MapPin,
  Fuel,
  FileSpreadsheet,
  Sun,
  Moon,
  Sunset,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  CloudRain,
  Activity,
  Users,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export default function Shell({
  children,
  title,
  sub,
  right,
  narrow,
  activeTab = "allocation",
  onTabChange,
}) {
  const { u, logout, switchRole } = useAuth();
  const { mode, preference, toggleTheme, cutoffTime, isAuto } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  const isDispatcher = u?.role === "DISPATCHER";

  const handleRoleSwitch = (demoUser) => {
    switchRole(demoUser);
    setShowRoleMenu(false);
    navigate(HOME[demoUser.role]);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "dispatch", label: "Live Dispatch", icon: Radio, badge: "12" },
    { id: "allocation", label: "Order Allocation", icon: Layers },
    { id: "fleet", label: "Fleet Management", icon: Truck },
    { id: "capacity", label: "Capacity Planning", icon: BarChart3 },
    { id: "routes", label: "Route Management", icon: MapPin },
    { id: "fuel", label: "Fuel Management", icon: Fuel },
    { id: "reports", label: "Reports", icon: FileSpreadsheet },
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      mode === "morning"
        ? "bg-[#F7F9FB] text-[#12181F]"
        : mode === "evening"
        ? "dark bg-[#1A1625] text-[#F5EDE0]"
        : "dark bg-[#0B0F17] text-[#E8EEF6]"
    }`}>
      {/* Top Main Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#1E2530] h-16 px-4 md:px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Brand Logo & Search */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo-icon.png"
              alt="Waypoint Logo"
              className="w-9 h-9 object-contain drop-shadow group-hover:scale-105 transition-transform duration-200"
            />
            <div>
              <div className="font-extrabold text-sm tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
                WAYPOINT <span className="text-[10px] text-blue-600 dark:text-amber-400 font-extrabold px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 rounded">GROUP</span>
              </div>
              <div className="text-[10px] text-gray-400 -mt-0.5 tracking-wider">Intelligent OMS</div>
            </div>
          </Link>

          {/* Search Bar with ⌘K */}
          <div className="hidden lg:flex items-center gap-2 bg-gray-100 dark:bg-gray-800/80 px-3.5 py-1.5 rounded-2xl w-80 border border-gray-200 dark:border-gray-700/60 text-xs">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, vehicles, districts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs text-gray-800 dark:text-gray-200 placeholder-gray-400"
            />
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 text-[10px] font-mono text-gray-400 shadow-sm">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Center/Right Actions: Date, Fleet Status, Theme Badge, User */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Date Selector */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>Thu, 24 Sep</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>

          {/* Fleet Status Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-2xl bg-gray-100 dark:bg-gray-800 text-xs border border-gray-200 dark:border-gray-700">
            <span className="font-bold text-gray-700 dark:text-gray-300">Fleet 42</span>
            <span className="text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full font-semibold text-[11px]">
              34 Available
            </span>
            <span className="text-amber-700 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-2 py-0.5 rounded-full font-semibold text-[11px]">
              8 In-Workshop
            </span>
          </div>

          {/* Time-based Theme Badge (cycles Auto → Morning → Evening → Night) */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purplePrimary text-xs font-bold border border-purple-200/60 dark:border-purple-800 transition"
            title="Click to cycle: Auto → Morning → Evening → Night"
          >
            {mode === "morning" && <Sun className="w-4 h-4 text-amber-500" />}
            {mode === "evening" && <Sunset className="w-4 h-4 text-orange-400" />}
            {mode === "night" && <Moon className="w-4 h-4 text-indigo-300" />}
            <span className="hidden sm:inline">
              {isAuto ? "Auto · " : ""}
              {mode === "morning" ? "Morning" : mode === "evening" ? "Evening" : "Night"} Mode
              {" · Fresh cutoff in "}{cutoffTime}
            </span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white dark:ring-[#1E2530]" />
            </button>

            {showAlerts && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E2530] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-3 z-50 animate-fadeIn">
                <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <span>Contextual Ops Alerts</span>
                  <span className="text-purplePrimary">3 New</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200">
                    <b>🎉 Vesak Festival Ramp Active</b>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">Expect +40% Fresh demand across Colombo & Gampaha.</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200">
                    <b>🌧 Monsoon Rain Warning</b>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-0.5">Kandy corridor speed reduced by 15%. ETAs adjusted.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Demo Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition text-left"
            >
              <div className="w-7 h-7 rounded-full bg-purplePrimary text-white flex items-center justify-center font-bold text-xs">
                {u?.name?.charAt(0) || "M"}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-gray-900 dark:text-gray-100">{u?.name || "Maya Chen"}</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{u?.role?.replace("_", " ") || "Dispatcher"}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1E2530] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-2 z-50 animate-fadeIn space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Switch Persona (Demo)
                </div>
                {DEMO_USERS.map((demo) => (
                  <button
                    key={demo.role + demo.username}
                    onClick={() => handleRoleSwitch(demo)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition ${
                      u?.role === demo.role
                        ? "bg-purplePrimary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <span>{demo.label}</span>
                    {u?.role === demo.role && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                ))}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-1 mt-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex">
        {/* Left Operations Sidebar (Dispatcher only) */}
        {isDispatcher && (
          <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-[#1E2530] border-r border-gray-200 dark:border-gray-800 min-h-[calc(100vh-4rem)] p-4 shrink-0 justify-between">
            <div className="space-y-6">
              <div>
                <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Operations
                </div>
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = (activeTab || "allocation") === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onTabChange && onTabChange(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition ${
                          active
                            ? "bg-purplePrimary text-white shadow-md shadow-purplePrimary/20"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${active ? "bg-white/20 text-white" : "bg-purple-100 text-purplePrimary dark:bg-purple-950"}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Bottom Sidebar Widgets: Network Health & Weather */}
            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              {/* Network Health */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/60 text-xs">
                <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" /> Network Health
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">96.8%</span>
                </div>
                <div className="text-[10px] text-gray-400">All hubs connected · Live telemetry</div>
              </div>

              {/* Weather Widget */}
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-extrabold text-sm">13°C</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">H:16° L:8° · Kandy</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-md">
                    Showers
                  </span>
                </div>
              </div>

              {/* Red Logout Button */}
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold text-xs transition"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 p-4 md:p-6 overflow-x-hidden ${narrow ? "max-w-xl mx-auto" : ""}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                {title}
              </h1>
              {sub && <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
            </div>
            {right}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
