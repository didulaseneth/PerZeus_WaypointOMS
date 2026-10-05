import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./index.css";
import { AuthProvider, Guard, HOME, useAuth } from "./auth";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Dispatcher from "./pages/Dispatcher";
import StoreManager from "./pages/StoreManager";
import Loader from "./pages/Loader";
import Driver from "./pages/Driver";

const Home = () => {
  const { u } = useAuth();
  return <Navigate to={u ? HOME[u.role] || "/dispatcher" : "/login"} replace />;
};

const Protected = (role, Component) => (
  <Guard role={role}>
    <Component />
  </Guard>
);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dispatcher" element={Protected("DISPATCHER", Dispatcher)} />
            <Route path="/store-manager" element={Protected("STORE_MANAGER", StoreManager)} />
            <Route path="/loader" element={Protected("LOADER", Loader)} />
            <Route path="/driver" element={Protected("DRIVER", Driver)} />
            <Route path="*" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);
