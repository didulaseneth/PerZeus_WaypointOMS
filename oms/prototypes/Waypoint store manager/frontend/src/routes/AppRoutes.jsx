import { Routes, Route, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

import Login from "../pages/store-manager/Login";
import Dashboard from "../pages/store-manager/Dashboard";
import MyOrders from "../pages/store-manager/MyOrders";
import PlaceOrder from "../pages/store-manager/PlaceOrder";
import IncomingDelivery from "../pages/store-manager/IncomingDelivery";
import Receiving from "../pages/store-manager/Receiving";
import Reports from "../pages/store-manager/Reports";

function Protected({ children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/sm/login" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sm/login" replace />} />
      <Route path="/sm/login" element={<Login />} />
      <Route path="/sm/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/sm/orders" element={<Protected><MyOrders /></Protected>} />
      <Route path="/sm/place-order" element={<Protected><PlaceOrder /></Protected>} />
      <Route path="/sm/incoming" element={<Protected><IncomingDelivery /></Protected>} />
      <Route path="/sm/receiving" element={<Protected><Receiving /></Protected>} />
      <Route path="/sm/reports" element={<Protected><Reports /></Protected>} />
      <Route path="*" element={<Navigate to="/sm/login" replace />} />
    </Routes>
  );
}