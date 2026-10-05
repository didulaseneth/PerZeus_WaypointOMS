import React, { useEffect, useState, useCallback, useRef } from "react";
import Shell from "../components/Shell";
import { api, send, flush, queueLen } from "../api";
import { useAuth } from "../auth";
import confetti from "canvas-confetti";
import {
  Truck,
  Navigation,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  PenTool,
  Clock,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export default function Driver() {
  const { u } = useAuth();
  const vehicleId = u?.vehicleId || "VEH001";

  const [run, setRun] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [recipient, setRecipient] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [qCount, setQCount] = useState(queueLen());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Signature canvas
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const loadRun = useCallback(() => {
    api
      .driverRun(vehicleId)
      .then((r) => {
        setRun(r);
        setIsOnline(true);
      })
      .catch(() => setIsOnline(false));
  }, [vehicleId]);

  useEffect(() => {
    loadRun();
    const interval = setInterval(async () => {
      if (queueLen() > 0 && navigator.onLine) {
        const remaining = await flush();
        setQCount(remaining);
      }
      if (queueLen() === 0) loadRun();
      setQCount(queueLen());
    }, 4000);
    return () => clearInterval(interval);
  }, [loadRun]);

  const toggleSimulateOffline = () => {
    setIsOnline((prev) => !prev);
  };

  const handleAction = async (order, status) => {
    const body = {
      status,
      recipient,
      signature: hasSignature ? "data:image/svg+xml;utf8,signed" : "",
      note: deliveryNote,
    };

    // Optimistically update UI
    setRun((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        trips: prev.trips.map((t) => ({
          ...t,
          orders: t.orders.map((x) => (x.orderRef === order.orderRef ? { ...x, delivery: status } : x)),
        })),
      };
    });

    try {
      await send(`/api/orders/${order.orderRef}/delivery`, body);
      setQCount(queueLen());
      if (status === "DELIVERED") {
        confetti({ particleCount: 50, origin: { y: 0.8 } });
        setSuccessMsg(`✓ Delivery confirmed for ${order.outletId}. POD recorded.`);
        setTimeout(() => setSuccessMsg(""), 4000);
        setRecipient("");
        setDeliveryNote("");
        clearCanvas();
      }
    } catch (err) {
      setErrorMsg("⚠ " + err.message);
      loadRun();
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#4D4DE9";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const allStops = run
    ? run.trips.flatMap((t) => t.orders.map((o) => ({ ...o, tripNo: t.trip })))
    : [];
  const currentStop = allStops.find((o) => ["PENDING", "ARRIVED"].includes(o.delivery));
  const completedCount = allStops.filter((o) => ["DELIVERED", "FAILED", "SKIPPED"].includes(o.delivery)).length;
  const veh = run?.vehicle;

  return (
    <Shell
      narrow
      title="Driver Navigation & POD"
      sub={veh ? `${veh.id} (${veh.driver || "Driver"}) · ${completedCount} of ${allStops.length} stops completed` : "Loading route..."}
      right={
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSimulateOffline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
              !isOnline
                ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                : qCount > 0
                ? "bg-amber-100 text-amber-900"
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{!isOnline ? `Offline (${qCount} queued)` : qCount > 0 ? `Syncing ${qCount}…` : "Online"}</span>
          </button>
        </div>
      }
    >
      {/* Alert Banners */}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 p-3.5 rounded-2xl mb-4 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-500" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 p-3.5 rounded-2xl mb-4 text-xs font-bold">
          {errorMsg}
        </div>
      )}

      {/* 1. VEHICLE NOT DEPARTED STATE */}
      {veh && !veh.departed && (
        <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-8 text-center border border-gray-200 dark:border-gray-800 space-y-3">
          <Truck className="w-12 h-12 mx-auto text-purplePrimary animate-bounce" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Run Awaiting Dock Loading</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            The dock loader is currently verifying and loading items onto vehicle <b>{veh.id}</b>. This screen will activate once departed.
          </p>
        </div>
      )}

      {/* 2. ACTIVE STOP EXECUTION CARD */}
      {veh?.departed && currentStop && (
        <div className="bg-white dark:bg-[#1E2530] rounded-3xl p-6 shadow-md border border-gray-200 dark:border-gray-800 space-y-4">
          {/* Active Stop Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purplePrimary">
                Stop {allStops.indexOf(currentStop) + 1} of {allStops.length} · Trip {currentStop.tripNo}
              </span>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                {currentStop.outletId}
              </h2>
              <p className="text-xs text-gray-500">{currentStop.district} District</p>
            </div>
            <div className="text-right">
              <span className="font-mono font-black text-lg text-purplePrimary">~{currentStop.eta}</span>
              <div className="text-[10px] text-gray-400">Target ETA</div>
            </div>
          </div>

          {/* Access Constraints Alert Banner */}
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Outlet Access Notice:
            </div>
            <div>
              • Dock Type: <b>{currentStop.dockType === "rear_dock" ? "Rear Dock Loading Bay" : currentStop.dockType === "street" ? "Curbside Unloading" : "Shared Mall Loading Bay"}</b>
              {currentStop.parking === "van_only" && " (Van-only access)"}
              {currentStop.mallWindow && ` · Mall access window: ${currentStop.mallWindow}`}
            </div>
            <div>• Delivery window: <b>{currentStop.windowOpen} – {currentStop.windowClose}</b></div>
          </div>

          {/* Cargo info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-2xl text-xs flex justify-between">
            <span>Cargo: <b>{currentStop.brand}</b> ({currentStop.temp})</span>
            <span><b>{currentStop.units}</b> units · <b>{currentStop.weightKg}</b> kg</span>
          </div>

          {/* Action Step 1: I've Arrived Button */}
          {currentStop.delivery === "PENDING" ? (
            <button
              onClick={() => handleAction(currentStop, "ARRIVED")}
              className="w-full py-5 rounded-2xl bg-purplePrimary hover:bg-purple-700 text-white font-black text-base transition shadow-xl shadow-purplePrimary/30 flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" /> I've Arrived at Outlet
            </button>
          ) : (
            /* Action Step 2: Proof of Delivery (POD) Form */
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Recipient Name (Store Staff)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunil Silva (Store Manager)"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-semibold outline-none focus:ring-2 focus:ring-purplePrimary"
                />
              </div>

              {/* Interactive Digital Signature Pad */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-purplePrimary" /> Digital Recipient Signature
                  </label>
                  {hasSignature && (
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="text-[11px] font-bold text-red-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <canvas
                  ref={canvasRef}
                  width={360}
                  height={110}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-28 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 cursor-crosshair touch-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Driver Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received in good condition at rear dock."
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs outline-none focus:ring-2 focus:ring-purplePrimary"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  disabled={!recipient.trim()}
                  onClick={() => handleAction(currentStop, "DELIVERED")}
                  className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white font-black text-sm transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> Complete Delivery (POD)
                </button>
                <button
                  onClick={() => handleAction(currentStop, "FAILED")}
                  className="w-full py-3 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4" /> Report Exception / Outlet Closed
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. ALL STOPS COMPLETE STATE */}
      {veh?.departed && !currentStop && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-8 text-center space-y-2">
          <CheckCircle className="w-12 h-12 mx-auto text-emerald-500" />
          <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-100">
            All Route Stops Complete!
          </h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-xs mx-auto">
            Vehicle {veh.id} has finished all deliveries for today. Return to {veh.depot} Central Hub.
          </p>
        </div>
      )}

      {/* Route Stops List History */}
      <div className="mt-6 space-y-2">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Route Itinerary ({allStops.length} Stops)
        </h4>
        <div className="space-y-2">
          {allStops.map((o, idx) => (
            <div
              key={o.orderRef}
              className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition ${
                o.delivery === "DELIVERED"
                  ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40"
                  : o.delivery === "ARRIVED"
                  ? "bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-800"
                  : o.delivery === "FAILED" || o.delivery === "SKIPPED"
                  ? "bg-red-50/60 dark:bg-red-950/20 border-red-200"
                  : "bg-white dark:bg-[#1E2530] border-gray-200 dark:border-gray-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-500">{idx + 1}.</span>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">{o.outletId}</span>
                  <span className="text-[11px] text-gray-400 ml-1.5 font-mono">({o.eta})</span>
                </div>
              </div>

              <span
                className={`font-bold text-[11px] px-2.5 py-0.5 rounded-full ${
                  o.delivery === "DELIVERED"
                    ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-300"
                    : o.delivery === "ARRIVED"
                    ? "text-purplePrimary bg-purple-100 dark:bg-purple-900/60"
                    : o.delivery === "FAILED" || o.delivery === "SKIPPED"
                    ? "text-red-700 bg-red-100"
                    : "text-gray-500 bg-gray-100 dark:bg-gray-800"
                }`}
              >
                {o.delivery || "Scheduled"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
