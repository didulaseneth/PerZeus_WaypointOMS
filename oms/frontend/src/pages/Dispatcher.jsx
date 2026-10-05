import React, { useEffect, useState, useCallback } from "react";
import Shell from "../components/Shell";
import OrderCard from "../components/OrderCard";
import RouteDialog from "../components/RouteDialog";
import DeferModal from "../components/DeferModal";
import FleetTab from "../components/FleetTab";
import CapacityTab from "../components/CapacityTab";
import FuelTab from "../components/FuelTab";
import { api } from "../api";
import confetti from "canvas-confetti";
import {
  Wand2,
  RotateCcw,
  CheckCircle,
  Truck,
  Layers,
  AlertTriangle,
  Clock,
  Fuel,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  MapPin,
  Sparkles,
  ArrowRight,
  Search,
  Gauge,
  Download,
  ClipboardCheck,
  Shuffle,
  CalendarClock,
} from "lucide-react";

export default function Dispatcher() {
  const [board, setBoard] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [openVehicleModal, setOpenVehicleModal] = useState(null);
  const [deferringOrder, setDeferringOrder] = useState(null);
  const [activeNavTab, setActiveNavTab] = useState("allocation");
  const [brandFilter, setBrandFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOverTarget, setDragOverTarget] = useState("");
  const [depot, setDepot] = useState("Peliyagoda");
  const [report, setReport] = useState(null);

  const loadData = useCallback(() => {
    api
      .board(depot)
      .then(setBoard)
      .catch((e) => setError(e.message));
  }, [depot]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  const executeAction = (promise, successText = "") => {
    return promise
      .then((res) => {
        setError("");
        if (successText || res?.message) {
          setSuccessMsg(successText || res.message);
          setTimeout(() => setSuccessMsg(""), 4000);
        }
        return loadData();
      })
      .catch((err) => {
        setError("⚠ " + err.message);
        setTimeout(() => setError(""), 6000);
      });
  };

  const handleDrop = (e, vehicleId, trip) => {
    e.preventDefault();
    setDragOverTarget("");
    const orderRef = e.dataTransfer.getData("ref");
    if (orderRef) {
      executeAction(api.assign(orderRef, vehicleId, trip), `Order ${orderRef} assigned to ${vehicleId} (Trip ${trip})`);
    }
  };

  const handleUnassign = (order) => {
    executeAction(api.unassign(order.orderRef), `Order ${order.orderRef} returned to unallocated queue.`);
  };

  const handleAutoAllocate = () => {
    executeAction(api.autoAllocate(depot)).then(() => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    });
  };

  // Re-plan everything that has not departed (keeps nothing manual) and defer whatever cannot be served.
  const handleReplanAll = () => {
    if (
      window.confirm(
        "Re-plan ALL orders that have not departed using the priority policy? Manual assignments will be replaced and orders that cannot be served will be deferred."
      )
    ) {
      executeAction(api.autoAllocate(depot, { rebuild: true, deferRest: true })).then(() =>
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } })
      );
    }
  };

  const handleDeferRemaining = () => {
    if (window.confirm("Defer every order that is still unallocated? Each gets the reason it lost out.")) {
      executeAction(api.deferRemaining(depot));
    }
  };

  // Same rules as the official check_allocation.py, run against the live board.
  const handleCheck = () =>
    api
      .validate(depot)
      .then((r) => {
        setReport(r);
        setError("");
        return r;
      })
      .catch((e) => {
        setError("⚠ " + e.message);
        setTimeout(() => setError(""), 6000);
      });

  const handleConfirmPlan = () =>
    handleCheck().then((r) => {
      if (r && r.passed) {
        confetti();
        setSuccessMsg(`Plan verified: ${r.served} served, ${r.deferred} deferred across ${r.vehiclesUsed} vehicles / ${r.trips} trips. Docks notified.`);
        setTimeout(() => setSuccessMsg(""), 6000);
      }
    });

  const handleReset = () => {
    if (window.confirm("Reset all allocations back to unallocated queue for this depot?")) {
      executeAction(api.resetAllocations(depot), "All allocations reset to unallocated queue.");
    }
  };

  const handleConfirmDeferral = (orderRef, reason, notes, rescheduleDate) => {
    return executeAction(
      api.defer(orderRef, reason, notes, rescheduleDate),
      `Order ${orderRef} deferred (${reason}).`
    );
  };

  const handleLoaderChange = (vehicleId, loaderId) => {
    executeAction(api.loader(vehicleId, loaderId), `Loader updated for vehicle ${vehicleId}.`);
  };

  if (!board) {
    return (
      <Shell title="Order Allocation" sub={error || "Loading dispatch data from Central Hub..."}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purplePrimary" />
        </div>
      </Shell>
    );
  }

  const stats = board.stats || {};
  const availableVehicles = board.vehicles.filter((v) => v.vehicle.status === "available");
  const modalVehicle = openVehicleModal && board.vehicles.find((v) => v.vehicle.id === openVehicleModal);

  // Filter unallocated orders: ONLY unallocated orders are shown (assigned orders are hidden)
  const unallocatedList = (board.orders || []).filter((o) => {
    const matchesBrand = brandFilter === "All" || o.brand === brandFilter;
    const matchesSearch =
      !searchQuery ||
      o.orderRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.outletId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.district.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const getTabTitle = () => {
    switch (activeNavTab) {
      case "dashboard": return "Operations Dashboard";
      case "dispatch": case "routes": return "Live Dispatch & Routes";
      case "fleet": return "Fleet Management & Roster";
      case "capacity": return "Capacity Planning & Headroom";
      case "fuel": return "Fuel Management & Quota Telemetry";
      case "deferrals": return "Deferral Management & History";
      case "reports": return "Logistics Operations Reports";
      default: return "Order Allocation";
    }
  };

  const getTabSub = () => {
    switch (activeNavTab) {
      case "dashboard": return "Metro retail distribution — Peliyagoda & Kandy Hubs · Live Telemetry";
      case "dispatch": case "routes": return "Real-time driver tracking, delivery progress, and route execution.";
      case "fleet": return "60 Vehicles · Real-time telemetry, maintenance scheduling, health scoring, and driver/loader assignments.";
      case "capacity": return "Weight, volume, refrigeration meters, van-only access constraints, and 8-week predictive demand forecasts.";
      case "fuel": return "Weekly quota monitoring, route distance burn rate, cost in LKR, CO2 footprint, and eco-routing advisor.";
      case "deferrals": return "Track deferred orders, skipped outlets, and reschedule plans.";
      case "reports": return "Summary of order fulfillment, fleet utilization, and fuel efficiency metrics.";
      default: return "Assign confirmed orders to vehicles and trips for Peliyagoda & Kandy. Drag an order onto a trip slot.";
    }
  };

  return (
    <Shell
      title={getTabTitle()}
      sub={getTabSub()}
      activeTab={activeNavTab}
      onTabChange={setActiveNavTab}
      right={
        <div className="flex items-center gap-2">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-2 rounded-2xl text-xs font-bold animate-shake">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-2xl text-xs font-bold animate-fadeIn flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> {successMsg}
            </div>
          )}
        </div>
      }
    >
      {/* 1. ORDER ALLOCATION TAB (Primary Focus) */}
      {activeNavTab === "allocation" && (
        <div className="space-y-6">
          {/* Feasibility report (same rules as check_allocation.py) */}
          {report && (
            <div
              className={`rounded-3xl border p-4 text-xs ${
                report.passed
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                  : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-black text-sm">{report.message}</div>
                <button onClick={() => setReport(null)} className="font-bold opacity-70 hover:opacity-100">
                  Dismiss
                </button>
              </div>
              <div className="mt-1 font-semibold opacity-80">
                {report.served} served · {report.deferred} deferred · {report.vehiclesUsed} vehicles · {report.trips} trips
              </div>
              {(report.errors || []).length > 0 && (
                <ul className="mt-2 list-disc pl-5 space-y-0.5 max-h-40 overflow-auto">
                  {report.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
              {(report.warnings || []).map((w, i) => (
                <div key={i} className="mt-1 opacity-80">note: {w}</div>
              ))}
            </div>
          )}
          {/* Top KPI Banner (Matching Screenshot) */}
          <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-5 shadow-sm border border-gray-200 dark:border-gray-800/80 flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-8 md:gap-12">
              <div>
                <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  {stats.allocated} / {stats.total}
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Orders Allocated
                </div>
              </div>

              <div>
                <div className="text-2xl md:text-3xl font-black text-purplePrimary">
                  {stats.unallocated}
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Still Unallocated
                </div>
              </div>

              <div>
                <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  {Math.round(stats.weightKg || 0).toLocaleString()} kg
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Total Demand Weight
                </div>
              </div>

              <div>
                <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">
                  {(stats.volumeM3 || 0).toFixed(1)} m³
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Total Demand Volume
                </div>
              </div>

              <div>
                <div className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {stats.fleetCapacityPct || 12}%
                </div>
                <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Fleet Capacity Used
                </div>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleAutoAllocate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purplePrimary text-xs font-bold border border-purple-200 dark:border-purple-800 transition shadow-sm"
              >
                <Wand2 className="w-4 h-4" /> Auto-allocate remaining
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold transition"
                title="Reset allocations"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleReplanAll}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold transition"
                title="Re-plan everything with the priority policy"
              >
                <Shuffle className="w-3.5 h-3.5" /> Re-plan all
              </button>
              <button
                onClick={handleDeferRemaining}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold transition"
                title="Defer every unallocated order with an explained reason"
              >
                <CalendarClock className="w-3.5 h-3.5" /> Defer remaining
              </button>
              <button
                onClick={handleCheck}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold transition"
                title="Run the feasibility checker"
              >
                <ClipboardCheck className="w-3.5 h-3.5" /> Check
              </button>
              <a
                href={api.exportUrl}
                download="submission_task2b.csv"
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold transition"
                title="Download submission_task2b.csv"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </a>
              <button
                onClick={handleConfirmPlan}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purplePrimary hover:bg-purple-700 text-white text-xs font-bold transition shadow-md shadow-purplePrimary/30"
              >
                <CheckCircle className="w-4 h-4" /> Confirm plan
              </button>
            </div>
          </div>

          {/* 2-Column Allocation Board (Unallocated Orders Left, Vehicles Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
            {/* Left Column: Unallocated Orders */}
            <section className="bg-white dark:bg-[#1E2530] rounded-3xl p-5 shadow-sm border border-gray-200 dark:border-gray-800/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Unallocated Orders</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purplePrimary">
                    {unallocatedList.length}
                  </span>
                </div>
                <span className="text-[11px] font-bold bg-neutral1 dark:bg-purple-950 text-purplePrimary px-2.5 py-1 rounded-full">
                  Drag & Drop
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Allocate your confirmed orders to vehicles
              </p>

              {/* Brand Filter Tabs & Search */}
              <div className="space-y-2 mb-4">
                <div className="flex gap-1.5 p-1 bg-gray-100 dark:bg-gray-800/70 rounded-2xl">
                  {["All", "Fresh", "Style", "Tech"].map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setBrandFilter(brand)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                        brandFilter === brand
                          ? "bg-purplePrimary text-white shadow-sm"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by outlet or district..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 text-xs outline-none focus:ring-2 focus:ring-purplePrimary"
                  />
                </div>
              </div>

              {/* Draggable Order Cards List (Assigned orders are hidden from this list!) */}
              <div className="space-y-2.5 max-h-[64vh] overflow-y-auto pr-1">
                {unallocatedList.map((order) => (
                  <OrderCard
                    key={order.orderRef}
                    o={order}
                    onDefer={(o) => setDeferringOrder(o)}
                  />
                ))}

                {unallocatedList.length === 0 && (
                  <div className="py-12 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                      All Orders Allocated!
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                      All confirmed orders have been placed on trips or deferred. Click "Confirm plan" above.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Right Column: Fleet Roster & Trip Slots */}
            <section className="space-y-4 max-h-[82vh] overflow-y-auto pr-1">
              {board.vehicles.map((v) => {
                const veh = v.vehicle;
                const isAvailable = veh.status === "available";
                const totalOrdersOnVeh = v.trips.reduce((acc, t) => acc + t.orders.length, 0);

                return (
                  <div
                    key={veh.id}
                    className={`bg-white dark:bg-[#1E2530] rounded-3xl p-5 shadow-sm border border-gray-200 dark:border-gray-800/80 transition ${
                      isAvailable ? "" : "opacity-60 bg-gray-50 dark:bg-gray-900/40"
                    }`}
                  >
                    {/* Vehicle Header Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            isAvailable ? "bg-purplePrimary shadow-sm shadow-purplePrimary" : "bg-amber-400"
                          }`}
                        />
                        <button
                          disabled={!isAvailable}
                          onClick={() => setOpenVehicleModal(veh.id)}
                          className="text-base font-extrabold text-gray-900 dark:text-white hover:text-purplePrimary transition flex items-center gap-1.5"
                        >
                          {veh.id}
                          <span className="text-xs font-semibold text-gray-400">({veh.type})</span>
                        </button>

                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          {veh.temp === "reefer" ? "❄ Reefer" : "Ambient"} · {veh.weightCap}kg / {veh.volumeCap}m³ · Driver: <b>{veh.driver || "K. Perera"}</b>
                        </span>

                        <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
                          <Fuel className="w-3 h-3 text-purplePrimary" /> Fuel left: {veh.fuelLeft || 210} L
                        </span>
                      </div>

                      {/* Right Controls: Loader selector + Route & Map button */}
                      <div className="flex items-center gap-2 ml-auto">
                        {isAvailable ? (
                          <>
                            {/* Loader Selector Dropdown */}
                            <div className="flex items-center gap-1.5 bg-purple-50/50 dark:bg-purple-950/30 px-2.5 py-1 rounded-xl border border-purple-100 dark:border-purple-900/40">
                              <ShieldCheck className="w-3.5 h-3.5 text-purplePrimary" />
                              <select
                                value={v.loader?.id || ""}
                                onChange={(e) => handleLoaderChange(veh.id, e.target.value)}
                                className="bg-transparent text-xs font-semibold text-purple900 dark:text-purple-200 outline-none cursor-pointer"
                              >
                                <option value="">Select Loader</option>
                                {board.loaders.map((l) => (
                                  <option key={l.id} value={l.id}>
                                    {l.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Route & Map Dialog Trigger */}
                            <button
                              onClick={() => setOpenVehicleModal(veh.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-purplePrimary hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm"
                            >
                              Route & Map
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 dark:bg-amber-950 dark:text-amber-300 px-3 py-1 rounded-full">
                            In-Workshop
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Trip 1 & Trip 2 Slots */}
                    {isAvailable && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {v.trips.map((trip) => {
                          const slotId = veh.id + "-" + trip.trip;
                          const isDragOver = dragOverTarget === slotId;
                          const isFresh = trip.orders[0]?.brand === "Fresh";
                          const maxBudget = isFresh ? 270 : 480;

                          return (
                            <div
                              key={trip.trip}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setDragOverTarget(slotId);
                              }}
                              onDragLeave={() => setDragOverTarget("")}
                              onDrop={(e) => handleDrop(e, veh.id, trip.trip)}
                              className={`rounded-2xl p-3.5 min-h-[105px] border-2 border-dashed transition duration-200 ${
                                isDragOver
                                  ? "border-purplePrimary bg-purple-50/70 dark:bg-purple-950/40 scale-[1.01]"
                                  : "border-gray-200 dark:border-gray-700/60 bg-gray-50/70 dark:bg-gray-800/30 hover:border-gray-300"
                              }`}
                            >
                              {/* Trip Slot Header */}
                              <div className="flex items-center justify-between text-xs font-bold mb-2">
                                <span className="text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                  Trip {trip.trip}
                                  {trip.district && (
                                    <span className="text-purplePrimary font-semibold">
                                      · {trip.brand} ({trip.district})
                                    </span>
                                  )}
                                </span>
                                {trip.orders.length > 0 && (
                                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal">
                                    {trip.minutes}m / {maxBudget}m · {Math.round(trip.weightKg)}kg / {veh.weightCap}kg · {trip.volumeM3.toFixed(1)}m³
                                  </span>
                                )}
                              </div>

                              {/* Allocated Order Chips inside Trip Slot */}
                              {trip.orders.length > 0 ? (
                                <div className="space-y-1.5">
                                  {trip.orders.map((order) => (
                                    <OrderCard
                                      key={order.orderRef}
                                      o={order}
                                      compact
                                      onRemove={handleUnassign}
                                    />
                                  ))}
                                </div>
                              ) : (
                                <div className="py-5 text-center text-xs text-gray-400 dark:text-gray-500 font-medium">
                                  Drop an order here
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          </div>
        </div>
      )}

      {/* 2. DASHBOARD VIEW (Matching Dispatcher Dashboard Screen Image) */}
      {activeNavTab === "dashboard" && (
        <div className="space-y-6">
          {/* Top 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-[#1E2530] p-5 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purplePrimary flex items-center justify-center font-bold mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">15</div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Confirmed orders today</p>
              <p className="text-[11px] text-purplePrimary font-semibold mt-1">6 require refrigeration</p>
            </div>

            <div className="bg-white dark:bg-[#1E2530] p-5 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">3</div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Open alerts</p>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">Includes 1 vehicle in-workshop</p>
            </div>

            <div className="bg-white dark:bg-[#1E2530] p-5 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">3</div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Open deferrals</p>
              <p className="text-[11px] text-amber-600 font-semibold mt-1">1 outlet skipped twice in a row</p>
            </div>

            <div className="bg-white dark:bg-[#1E2530] p-5 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">12 / 14</div>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">Vehicles available</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">2 in workshop today</p>
            </div>
          </div>

          {/* Bottom Grid: Today Allocated Orders Map & Capacity Planning Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card: Today Allocated Orders */}
            <div className="bg-white dark:bg-[#1E2530] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today Allocated Orders</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Real-time route and driver activity</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purplePrimary dark:bg-purple-950">
                  12 on road
                </span>
              </div>

              {/* Visual Route Grid Simulation */}
              <div className="h-64 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-4 relative overflow-hidden flex flex-col justify-between">
                <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> 12 routes live
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-900/80 text-xs backdrop-blur-sm shadow-sm flex items-center justify-between">
                    <span>VEH001 · Colombo Fresh Route</span>
                    <span className="font-bold text-purplePrimary">45% Completed</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/80 dark:bg-gray-900/80 text-xs backdrop-blur-sm shadow-sm flex items-center justify-between">
                    <span>VEH003 · Gampaha Fresh Route</span>
                    <span className="font-bold text-emerald-600">Arrived at Outlet</span>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] font-semibold text-gray-500">
                  <span>ACTIVE ROUTES: 8 Peliyagoda / 4 Kandy</span>
                  <span>PRIORITY ALERTS: 0 Critical</span>
                </div>
              </div>
            </div>

            {/* Right Card: Capacity Planning Forecast Chart */}
            <div className="bg-white dark:bg-[#1E2530] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Capacity Planning</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Forecast chilled demand projected to exceed reefer capacity in Wk44.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-gray-400">MAX FLEET CAP</span>
              </div>

              {/* Bar Chart Representation */}
              <div className="h-64 pt-6 flex items-end justify-between gap-3 border-b border-gray-200 dark:border-gray-700 relative">
                {/* Max dashed line */}
                <div className="absolute top-10 left-0 right-0 border-b-2 border-dashed border-blue-400 flex justify-end">
                  <span className="text-[10px] font-bold text-blue-500 bg-white dark:bg-[#1E2530] px-1 -mt-2">
                    MAX CAP
                  </span>
                </div>

                {[
                  { wk: "Wk40", height: "85%", fill: "bg-purplePrimary" },
                  { wk: "Wk41", height: "45%", fill: "bg-gray-300 dark:bg-gray-700" },
                  { wk: "Wk42", height: "80%", fill: "bg-purplePrimary" },
                  { wk: "Wk43", height: "35%", fill: "bg-gray-300 dark:bg-gray-700" },
                  { wk: "Wk44", height: "92%", fill: "bg-gray-300 dark:bg-gray-700" },
                  { wk: "Wk45", height: "50%", fill: "bg-gray-300 dark:bg-gray-700" },
                  { wk: "Wk46", height: "70%", fill: "bg-gray-300 dark:bg-gray-700" },
                ].map((bar) => (
                  <div key={bar.wk} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      className={`w-full rounded-xl transition-all duration-500 ${bar.fill}`}
                      style={{ height: bar.height }}
                    />
                    <span className="text-[11px] font-bold text-gray-500">{bar.wk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. FLEET MANAGEMENT TAB */}
      {activeNavTab === "fleet" && (
        <FleetTab
          depot={depot}
          onOpenRouteModal={(vid) => setOpenVehicleModal(vid)}
          onShowSuccess={(m) => {
            setSuccessMsg(m);
            setTimeout(() => setSuccessMsg(""), 4000);
          }}
          onShowError={(e) => {
            setError(e);
            setTimeout(() => setError(""), 6000);
          }}
        />
      )}

      {/* 4. CAPACITY PLANNING TAB */}
      {activeNavTab === "capacity" && (
        <CapacityTab
          depot={depot}
          onShowSuccess={(m) => {
            setSuccessMsg(m);
            setTimeout(() => setSuccessMsg(""), 4000);
          }}
          onShowError={(e) => {
            setError(e);
            setTimeout(() => setError(""), 6000);
          }}
        />
      )}

      {/* 5. FUEL MANAGEMENT TAB */}
      {activeNavTab === "fuel" && (
        <FuelTab
          depot={depot}
          onShowSuccess={(m) => {
            setSuccessMsg(m);
            setTimeout(() => setSuccessMsg(""), 4000);
          }}
          onShowError={(e) => {
            setError(e);
            setTimeout(() => setError(""), 6000);
          }}
        />
      )}

      {/* 6. OPERATIONS DASHBOARD & LIVE DISPATCH TAB */}
      {(activeNavTab === "dashboard" || activeNavTab === "dispatch" || activeNavTab === "routes" || activeNavTab === "reports") && (
        <div className="space-y-6">
          {/* Top Quick Links to Operations Modules */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveNavTab("allocation")}
              className="p-5 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-purplePrimary transition text-left group"
            >
              <div className="flex justify-between items-center text-purplePrimary mb-2">
                <Layers className="w-6 h-6" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="font-extrabold text-base text-gray-900 dark:text-white">Order Allocation</div>
              <div className="text-xs text-gray-500 mt-1">{stats.unallocated || 0} orders waiting in queue</div>
            </button>

            <button
              onClick={() => setActiveNavTab("fleet")}
              className="p-5 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-blue-500 transition text-left group"
            >
              <div className="flex justify-between items-center text-blue-600 mb-2">
                <Truck className="w-6 h-6" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="font-extrabold text-base text-gray-900 dark:text-white">Fleet Management</div>
              <div className="text-xs text-gray-500 mt-1">{stats.availableVehicles || 0} ready · {stats.workshopVehicles || 0} in workshop</div>
            </button>

            <button
              onClick={() => setActiveNavTab("capacity")}
              className="p-5 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-indigo-500 transition text-left group"
            >
              <div className="flex justify-between items-center text-indigo-600 mb-2">
                <Gauge className="w-6 h-6" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="font-extrabold text-base text-gray-900 dark:text-white">Capacity Planning</div>
              <div className="text-xs text-gray-500 mt-1">{stats.fleetCapacityPct || 12}% fleet utilized today</div>
            </button>

            <button
              onClick={() => setActiveNavTab("fuel")}
              className="p-5 rounded-3xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-800 shadow-sm hover:border-amber-500 transition text-left group"
            >
              <div className="flex justify-between items-center text-amber-600 mb-2">
                <Fuel className="w-6 h-6" />
                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="font-extrabold text-base text-gray-900 dark:text-white">Fuel Management</div>
              <div className="text-xs text-gray-500 mt-1">Weekly quotas & distance telemetry</div>
            </button>
          </div>

          {/* Active Routes & Telemetry Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-[#1E2530] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today's Live Fleet Activity</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Departed trucks, dock loading, and on-road stops</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Live Dispatch
                </span>
              </div>

              <div className="space-y-3">
                {board.vehicles.slice(0, 5).map(({ vehicle: v, trips }) => {
                  const trip1Orders = trips?.[0]?.orders || [];
                  return (
                    <div
                      key={v.id}
                      onClick={() => setOpenVehicleModal(v.id)}
                      className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purplePrimary font-bold flex items-center justify-center text-xs">
                          {v.type === "van" ? "VAN" : "TRK"}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            {v.id} <span className="text-gray-400">· Driver: {v.driver}</span>
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {trip1Orders.length > 0 ? `${trip1Orders.length} stops (${trips[0].brand} - ${trips[0].district})` : "No orders allocated"}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${v.departed ? "bg-purple-100 text-purplePrimary" : v.status === "available" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {v.departed ? "In Transit" : v.status === "available" ? "Available" : "In Workshop"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white dark:bg-[#1E2530] p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Alerts & Advisory</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Weather disruptions, festival surges, and vehicle maintenance</p>
                </div>
              </div>

              <div className="space-y-3">
                {(board.alerts || []).map((al) => (
                  <div
                    key={al.id}
                    className={`p-4 rounded-2xl border text-xs space-y-1 ${
                      al.severity === "urgent"
                        ? "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-200"
                        : al.severity === "warning"
                        ? "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200"
                        : "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200"
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span>{al.title}</span>
                      <span className="text-[10px] font-normal text-gray-500">{al.time}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-400">{al.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. DEFERRALS TAB */}
      {activeNavTab === "deferrals" && (
        <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Deferral History & Trends</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Outlets deferred or skipped in previous cycles requiring prioritization.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Outlet ID</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Consecutive Skips</th>
                  <th className="py-3 px-4">Deferral Reason</th>
                  <th className="py-3 px-4">Reschedule Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(board.deferralHistory || []).map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-purplePrimary">{item.orderRef}</td>
                    <td className="py-3 px-4 font-bold">{item.outletId}</td>
                    <td className="py-3 px-4">{item.district}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${item.consecutiveSkips >= 2 ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950"}`}>
                        {item.consecutiveSkips} skips
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{item.reason}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-600">{item.rescheduleDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Route & Live Map Dialog (Frame 8) */}
      {modalVehicle && (
        <RouteDialog
          v={modalVehicle}
          loaders={board.loaders || []}
          districts={board.districts || []}
          onClose={() => setOpenVehicleModal(null)}
          onLoader={handleLoaderChange}
        />
      )}

      {/* Deferral Modal */}
      {deferringOrder && (
        <DeferModal
          order={deferringOrder}
          onClose={() => setDeferringOrder(null)}
          onConfirm={handleConfirmDeferral}
        />
      )}
    </Shell>
  );
}
