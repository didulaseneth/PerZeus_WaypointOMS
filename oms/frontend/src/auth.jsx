import React, { createContext, useContext, useState } from "react";
import { Navigate } from "react-router-dom";

const AuthContext = createContext();

/** In-app routes (Dispatcher stays in OMS; others go to dedicated systems) */
export const HOME = {
  DISPATCHER: "/dispatcher",
  LOADER: "/loader",
  DRIVER: "/driver",
  STORE_MANAGER: "/store-manager",
};

/**
 * Dedicated role systems (the original polished apps).
 * After login, non-dispatcher roles are redirected here.
 * Ports match docker-compose.
 */
export const ROLE_SYSTEMS = {
  DISPATCHER: null, // stays in OMS
  LOADER: "http://localhost:3002",
  DRIVER: "http://localhost:3000",
  STORE_MANAGER: "http://localhost:3001",
};

export const DEMO_USERS = [
  { label: "Lead Dispatcher", role: "DISPATCHER", username: "dispatcher", name: "Maya Chen", depot: "Peliyagoda" },
  { label: "Store Manager (OUT001)", role: "STORE_MANAGER", username: "out001", name: "Sunil Silva (Colombo Fresh)", outletId: "OUT001" },
  { label: "Warehouse Loader", role: "LOADER", username: "loader01", name: "Nimal (Loader)", loaderId: "LDR01" },
  { label: "Driver (VEH001)", role: "DRIVER", username: "driver001", name: "K. Perera", vehicleId: "VEH001" },
];

export function AuthProvider({ children }) {
  const [u, setU] = useState(() => {
    try {
      const raw = localStorage.getItem("wp_user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  });

  const login = (user) => {
    localStorage.setItem("wp_user", JSON.stringify(user));
    // Also expose under keys the dedicated apps can read
    localStorage.setItem("waypoint_auth", JSON.stringify(user));
    setU(user);
  };

  const logout = () => {
    localStorage.removeItem("wp_user");
    localStorage.removeItem("waypoint_auth");
    setU(null);
  };

  return (
    <AuthContext.Provider value={{ u, login, logout, switchRole: (user) => login(user) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function Guard({ role, children }) {
  const { u } = useAuth();
  if (!u) return <Navigate to="/login" replace />;
  if (role && u.role !== role) return <Navigate to={HOME[u.role] || "/login"} replace />;
  return children;
}

/** After successful login: Dispatcher stays in OMS; others open their dedicated system */
export function redirectAfterLogin(user, navigate) {
  const external = ROLE_SYSTEMS[user.role];
  if (external) {
    // Pass identity so the dedicated app can skip its own login if desired
    const q = new URLSearchParams({
      user: user.id || "",
      name: user.name || "",
      role: user.role || "",
      from: "unified-login",
    });
    window.location.href = `${external}/?${q.toString()}`;
    return;
  }
  navigate(HOME[user.role] || "/dispatcher");
}
