import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

function useCountdown(seconds) {
  const [t, setT] = useState(seconds);
  useEffect(() => {
    const i = setInterval(() => setT((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(i);
  }, []);
  const h = String(Math.floor(t / 3600)).padStart(2, "0");
  const m = String(Math.floor((t % 3600) / 60)).padStart(2, "0");
  const s = String(t % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function Header({ title }) {
  const { user, store } = useApp();
  const countdown = useCountdown(3 * 3600 + 59 * 60 + 54);

  return (
    <header className="bg-whiteCustom border-b border-gray2 px-6 py-4 flex items-center gap-4">
      <div className="flex-1">
        <h1 className="text-heading text-blackCustom">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="px-4 py-1.5 rounded-full bg-neutral1 text-purplePrimary text-secondaryText font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" d="M12 7v5l3 2" />
          </svg>
          Cutoff in {countdown}
        </span>

        <span className="px-4 py-1.5 rounded-full bg-gray1 text-gray6 text-secondaryText font-medium">
          {store.name}
        </span>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-neutral2" />
          <div className="leading-tight">
            <p className="text-secondaryText font-medium text-blackCustom">{user?.name}</p>
            <p className="text-small text-gray5">{user?.role}</p>
          </div>
        </div>

        <button className="relative w-9 h-9 rounded-full bg-secondaryYellow flex items-center justify-center">
          <svg className="w-5 h-5 text-yellow-900" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </div>
    </header>
  );
}