import { useState, useEffect } from "react";
import { getTimeOfDay, getThemeClasses } from "../../utils/time";

/**
 * Premium real-time clock widget for the Driver Dashboard header.
 *
 * Variants:
 *  - compact  : HH:MM + AM/PM pill   (used in header right-side)
 *  - widget   : Full block with date  (standalone use)
 */
const Clock = ({
  className = "",
  variant = "compact",
  // Legacy props kept for backward compat — other screens still pass these
  showIcon: _showIcon,
  showDate: _showDate,
}) => {
  const [now, setNow] = useState(new Date());
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
      setBlink((b) => !b);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const period = getTimeOfDay(now);
  const theme = getThemeClasses(period);

  const hours24 = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const isPM = hours24 >= 12;
  const hours12 = hours24 % 12 || 12;
  const hoursStr = String(hours12).padStart(2, "0");

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const dateLabel = `${dayNames[now.getDay()]}, ${now.getDate()} ${monthNames[now.getMonth()]}`;

  /* ─── Compact variant — sits in the header top-right ─── */
  if (variant === "compact") {
    return (
      <div
        className={`flex items-center gap-1.5 glass-card rounded-xl px-3 py-1.5 ${className}`}
        aria-live="polite"
        aria-label="Current time"
      >
        {/* Time digits */}
        <span className="text-whiteCustom text-[15px] font-bold tabular-nums tracking-tight leading-none">
          {hoursStr}
          <span
            className={`mx-0.5 transition-opacity duration-300 ${
              blink ? "opacity-100" : "opacity-30"
            }`}
          >
            :
          </span>
          {minutes}
        </span>
        {/* AM/PM pill */}
        <span className="text-[10px] font-bold tracking-widest text-neutral3 leading-none">
          {isPM ? "PM" : "AM"}
        </span>
      </div>
    );
  }

  /* ─── Widget variant — full standalone block ─── */
  return (
    <div
      className={`flex flex-col items-end ${theme.textSecondary} ${className}`}
      aria-live="polite"
      aria-label="Current time"
    >
      <div className="flex items-baseline gap-0.5 tabular-nums">
        <span className="text-[28px] font-black leading-none tracking-tight text-whiteCustom">
          {hoursStr}
        </span>
        <span
          className={`text-[22px] font-black leading-none text-neutral3 transition-opacity duration-300 ${
            blink ? "opacity-100" : "opacity-20"
          }`}
        >
          :
        </span>
        <span className="text-[28px] font-black leading-none tracking-tight text-whiteCustom">
          {minutes}
        </span>
        <span className="text-[13px] font-bold text-neutral4 ml-1 mb-0.5 tracking-widest">
          {isPM ? "PM" : "AM"}
        </span>
      </div>
      <span className="text-smallText text-neutral3 mt-0.5 tracking-wide">
        {dateLabel}
      </span>
    </div>
  );
};

export default Clock;
