import React from "react";
import { Snowflake, Truck, AlertCircle, Clock, X, CornerDownRight, AlertTriangle } from "lucide-react";

const BRAND_STYLES = {
  Fresh: {
    badge: "bg-[#BDF6CC] text-[#0d6832] dark:bg-[#1b432a] dark:text-[#7ce8a5]",
    border: "hover:border-[#2ecc71]",
    bar: "bg-[#2ecc71]",
  },
  Style: {
    badge: "bg-[#F9B9D9] text-[#861b4e] dark:bg-[#4a1830] dark:text-[#f89dc9]",
    border: "hover:border-[#e91e63]",
    bar: "bg-[#e91e63]",
  },
  Tech: {
    badge: "bg-[#FFDD99] text-[#7a4e00] dark:bg-[#4a3408] dark:text-[#ffd27a]",
    border: "hover:border-[#f39c12]",
    bar: "bg-[#f39c12]",
  },
};

export default function OrderCard({ o, onDefer, compact, onRemove }) {
  const brandStyle = BRAND_STYLES[o.brand] || BRAND_STYLES.Fresh;

  const handleDragStart = (e) => {
    e.dataTransfer.setData("ref", o.orderRef);
    e.dataTransfer.effectAllowed = "move";
  };

  if (compact) {
    return (
      <div
        className={`group relative p-2.5 rounded-xl bg-white dark:bg-[#1E2530] border border-gray-200 dark:border-gray-700/80 shadow-sm flex items-center justify-between gap-2 transition hover:shadow-md`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-1.5 h-6 rounded-full ${brandStyle.bar}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold truncate text-gray-900 dark:text-gray-100">
                {o.outletId} · {o.district}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${brandStyle.badge}`}>
                {o.brand}
              </span>
              {o.temp === "chilled" && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 flex items-center gap-0.5">
                  <Snowflake className="w-2.5 h-2.5" /> Chilled
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
              {o.orderRef} · {o.weightKg}kg / {o.volumeM3}m³ · {o.windowOpen}–{o.windowClose}
            </div>
          </div>
        </div>

        {onRemove && (
          <button
            onClick={() => onRemove(o)}
            title="Unassign order"
            className="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      title="Drag onto an available truck trip slot"
      className={`group relative bg-white dark:bg-[#1E2530] rounded-2xl p-3.5 cursor-grab active:cursor-grabbing border border-gray-200 dark:border-gray-700/70 shadow-sm hover:shadow-md transition-all duration-200 ${
        brandStyle.border
      } ${
        o.deferredYesterday
          ? "ring-2 ring-amber-400 bg-amber-50/20 dark:bg-amber-950/10"
          : ""
      }`}
    >
      {/* Top Header */}
      <div className="flex justify-between items-start gap-2 mb-1.5">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100 group-hover:text-purplePrimary transition">
              {o.brand} - {o.district}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            {o.orderRef} · <span className="font-semibold text-gray-700 dark:text-gray-300">{o.outletId}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${brandStyle.badge}`}>
            {o.brand}
          </span>
          {o.temp === "chilled" && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200 flex items-center gap-1">
              <Snowflake className="w-3 h-3 text-blue-500" /> Chilled
            </span>
          )}
        </div>
      </div>

      {/* Metrics & Meta */}
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-xl px-2.5 py-1.5 mb-2">
        <span><b>{o.weightKg}</b> kg</span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span><b>{o.volumeM3}</b> m³</span>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3 text-purplePrimary" /> {o.windowOpen}–{o.windowClose}
        </span>
      </div>

      {/* Badges & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-gray-100 dark:border-gray-800/80">
        <div className="flex items-center gap-1.5 flex-wrap">
          {o.parking === "van_only" && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 flex items-center gap-1">
              <Truck className="w-2.5 h-2.5" /> Van Only
            </span>
          )}
          {o.dockType && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {o.dockType}
            </span>
          )}
          {o.deferredYesterday === 1 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5 text-amber-600" /> Skipped Yesterday
            </span>
          )}
        </div>

        {onDefer && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDefer(o);
            }}
            className="text-xs font-semibold text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition ml-auto px-1.5 py-0.5 rounded hover:bg-amber-50 dark:hover:bg-amber-950/40"
          >
            Defer
          </button>
        )}
      </div>
    </div>
  );
}
