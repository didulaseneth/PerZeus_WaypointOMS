import React, { useEffect, useState, useCallback } from "react";
import Shell from "../components/Shell";
import { api } from "../api";
import { useAuth } from "../auth";
import confetti from "canvas-confetti";
import {
  ShoppingBag,
  PlusCircle,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Snowflake,
  FileCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function StoreManager() {
  const { u } = useAuth();
  const outletId = u?.outletId || "OUT001";

  const [tab, setTab] = useState("orders");
  const [ordersList, setOrdersList] = useState([]);
  const [outletInfo, setOutletInfo] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Order Form state
  const [form, setForm] = useState({
    brand: "Fresh",
    temp: "ambient",
    units: 25,
    weightKg: 180,
    volumeM3: 1.2,
    notes: "",
  });

  const loadOrders = useCallback(() => {
    api
      .storeOrders(outletId)
      .then(setOrdersList)
      .catch((e) => setErrorMsg(e.message));
  }, [outletId]);

  useEffect(() => {
    api.outlets().then((outlets) => {
      const found = outlets.find((x) => x.id === outletId);
      if (found) {
        setOutletInfo(found);
        setForm((prev) => ({ ...prev, brand: found.brand }));
      }
    });
    loadOrders();
    const interval = setInterval(loadOrders, 4000);
    return () => clearInterval(interval);
  }, [loadOrders, outletId]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg("");
    setErrorMsg("");

    try {
      const payload = {
        outletId,
        brand: outletInfo?.brand || form.brand,
        temp: form.temp,
        units: Number(form.units),
        weightKg: Number(form.weightKg),
        volumeM3: Number(form.volumeM3),
        notes: form.notes,
      };

      const res = await api.place(payload);
      confetti({ particleCount: 60, origin: { y: 0.7 } });
      setStatusMsg(`✓ Order ${res.orderRef} placed successfully! Transmitted to Central Dispatch.`);
      loadOrders();
      setTab("orders");
    } catch (err) {
      setErrorMsg("⚠ " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceiptAction = (order, isOk) => {
    let note = "";
    let claimType = "";
    if (!isOk) {
      const input = prompt(
        "Select Discrepancy Type:\n1 = Damaged Goods\n2 = Missing Items\n3 = Wrong Items",
        "1"
      );
      claimType =
        input === "1"
          ? "Damaged Goods"
          : input === "2"
          ? "Missing Items"
          : "Wrong Items";
      note = prompt("Enter specific issue details:") || "Discrepancy reported by store manager";
    }

    api
      .receipt(order.orderRef, isOk, note, claimType)
      .then(() => {
        setStatusMsg(
          isOk
            ? `✓ Receipt confirmed for ${order.orderRef}. Digital POD logged.`
            : `⚠ Claim submitted for ${order.orderRef} (${claimType}).`
        );
        loadOrders();
      })
      .catch((err) => setErrorMsg("⚠ " + err.message));
  };

  const getOrderStatusDisplay = (o) => {
    if (o.receipt === "CONFIRMED")
      return { label: "Receipt Confirmed", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" };
    if (o.receipt === "DISPUTED")
      return { label: "Discrepancy Reported", bg: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" };
    if (o.delivery === "DELIVERED")
      return { label: "Delivered — Please Confirm", bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse" };
    if (o.delivery === "ARRIVED")
      return { label: "Driver Arrived at Store", bg: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" };
    if (o.delivery === "FAILED")
      return { label: "Delivery Exception", bg: "bg-red-100 text-red-800 dark:bg-red-950" };
    if (o.delivery === "SKIPPED")
      return { label: "Shortfall — Not Dispatched", bg: "bg-amber-100 text-amber-800 dark:bg-amber-950" };
    if (o.status === "DEFERRED")
      return { label: "Deferred by Dispatcher", bg: "bg-amber-100 text-amber-800 dark:bg-amber-950" };
    if (o.delivery === "PENDING")
      return { label: "En Route on Truck", bg: "bg-purple-100 text-purplePrimary dark:bg-purple-950" };
    if (o.status === "ALLOCATED")
      return { label: o.loaded ? "Loaded on Vehicle" : "Scheduled on Route", bg: "bg-purple-50 text-purplePrimary dark:bg-purple-950" };
    return { label: "Confirmed — Awaiting Plan", bg: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" };
  };

  return (
    <Shell
      title={`Store Desk · ${outletId}`}
      sub={
        outletInfo
          ? `${outletInfo.brand} Outlet (${outletInfo.district}) · Window ${outletInfo.windowOpen}–${outletInfo.windowClose} · ${outletInfo.dockType}`
          : "Place orders before the 4:00 PM cutoff and track deliveries to your store."
      }
      right={
        <div className="flex items-center gap-2">
          {statusMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-2xl text-xs font-bold animate-fadeIn">
              {statusMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-2xl text-xs font-bold">
              {errorMsg}
            </div>
          )}
        </div>
      }
    >
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("orders")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            tab === "orders"
              ? "bg-purplePrimary text-white shadow-md shadow-purplePrimary/20"
              : "bg-white dark:bg-[#1E2530] text-gray-600 dark:text-gray-400 hover:text-gray-900 border border-gray-200 dark:border-gray-800"
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> My Orders ({ordersList.length})
        </button>
        <button
          onClick={() => setTab("new")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            tab === "new"
              ? "bg-purplePrimary text-white shadow-md shadow-purplePrimary/20"
              : "bg-white dark:bg-[#1E2530] text-gray-600 dark:text-gray-400 hover:text-gray-900 border border-gray-200 dark:border-gray-800"
          }`}
        >
          <PlusCircle className="w-4 h-4" /> Place New Order
        </button>
      </div>

      {/* 1. PLACE ORDER TAB */}
      {tab === "new" && (
        <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200 dark:border-gray-800 max-w-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">New Order Entry</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Transmitted directly to Dispatcher order allocation queue.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Cutoff 4:00 PM
            </span>
          </div>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            {/* Brand Presets */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Brand & Goods Category
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "Fresh", desc: "Groceries & chilled", badge: "bg-[#BDF6CC] text-[#0d6832]" },
                  { id: "Style", desc: "Garments & cartons", badge: "bg-[#F9B9D9] text-[#861b4e]" },
                  { id: "Tech", desc: "Electronics & appliances", badge: "bg-[#FFDD99] text-[#7a4e00]" },
                ].map((b) => (
                  <button
                    type="button"
                    key={b.id}
                    onClick={() => setForm({ ...form, brand: b.id })}
                    className={`p-3 rounded-2xl text-left border transition ${
                      form.brand === b.id
                        ? "border-purplePrimary bg-purple-50/50 dark:bg-purple-950/30 ring-1 ring-purplePrimary"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${b.badge}`}>
                      {b.id}
                    </span>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{b.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature Requirement (For Fresh) */}
            {form.brand === "Fresh" && (
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                  Temperature Requirement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, temp: "ambient" })}
                    className={`p-3 rounded-2xl text-left border text-xs font-bold transition ${
                      form.temp === "ambient"
                        ? "border-purplePrimary bg-purple-50 dark:bg-purple-950/30 text-purplePrimary"
                        : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    Ambient Goods (Dry grocery / bakery)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, temp: "chilled" })}
                    className={`p-3 rounded-2xl text-left border text-xs font-bold transition flex items-center gap-2 ${
                      form.temp === "chilled"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-300"
                        : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    <Snowflake className="w-4 h-4 text-blue-500" />
                    Chilled / Frozen (Reefer Vehicle Req.)
                  </button>
                </div>
              </div>
            )}

            {/* Units, Weight, Volume Inputs */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Item Units
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.units}
                  onChange={(e) => setForm({ ...form, units: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold focus:ring-2 focus:ring-purplePrimary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  required
                  step="0.1"
                  min="0.1"
                  value={form.weightKg}
                  onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold focus:ring-2 focus:ring-purplePrimary outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Volume (m³)
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={form.volumeM3}
                  onChange={(e) => setForm({ ...form, volumeM3: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold focus:ring-2 focus:ring-purplePrimary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Special Delivery Instructions / Notes
              </label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Unload at rear bay before 7:00 AM; dairy shipment priority."
                className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs focus:ring-2 focus:ring-purplePrimary outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-purplePrimary hover:bg-purple-700 text-white font-bold text-sm transition shadow-lg shadow-purplePrimary/30"
            >
              {isSubmitting ? "Transmitting Order..." : "Place Order & Send to Dispatcher"}
            </button>
          </form>
        </div>
      )}

      {/* 2. MY ORDERS LIST & TRACKING */}
      {tab === "orders" && (
        <div className="space-y-4 max-w-3xl">
          {ordersList.map((order) => {
            const st = getOrderStatusDisplay(order);

            return (
              <div
                key={order.orderRef}
                className="bg-white dark:bg-[#1E2530] rounded-3xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 space-y-3"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-extrabold text-gray-900 dark:text-white">
                        {order.orderRef}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {order.brand}
                      </span>
                      {order.temp === "chilled" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 flex items-center gap-1">
                          <Snowflake className="w-3 h-3" /> Chilled
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {order.units} units · {order.weightKg} kg · {order.volumeM3} m³
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${st.bg}`}>
                    {st.label}
                  </span>
                </div>

                {/* Delivery ETA & Sequence Info */}
                {order.eta ? (
                  <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-100 dark:border-purple-900/40 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-purplePrimary" />
                      <span>
                        Assigned to vehicle <b>{order.vehicleId}</b> · Stop <b>{order.stop}</b> of {order.stops} on the route
                      </span>
                    </div>
                    <span className="font-mono font-black text-purplePrimary text-sm">
                      ETA ~{order.eta}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Store delivery window: <b>{order.windowOpen} – {order.windowClose}</b>
                  </div>
                )}

                {/* Deferred Explanation Notice */}
                {order.status === "DEFERRED" && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <b>Order Deferred:</b> {order.deferReason || "Vehicle capacity constraint."}
                      <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                        Target reschedule: <b>{order.rescheduleDate || "Tomorrow Morning Run"}</b>. Priority queued.
                      </p>
                    </div>
                  </div>
                )}

                {/* Confirm Receipt & Discrepancy Action Buttons */}
                {order.delivery === "DELIVERED" && !order.receipt && (
                  <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => handleReceiptAction(order, true)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Confirm Receipt (POD)
                    </button>
                    <button
                      onClick={() => handleReceiptAction(order, false)}
                      className="flex-1 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <ShieldAlert className="w-4 h-4" /> Report Discrepancy
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {ordersList.length === 0 && (
            <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-10 text-center border border-gray-200 dark:border-gray-800 text-gray-400">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No orders placed yet</p>
              <p className="text-xs text-gray-400 mt-1">Click "Place New Order" above to transmit an order.</p>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
