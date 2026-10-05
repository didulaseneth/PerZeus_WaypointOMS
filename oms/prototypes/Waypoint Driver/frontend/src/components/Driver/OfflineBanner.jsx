import { WifiOff, Wifi } from "lucide-react";

/**
 * Offline mode banner shown at the top of dashboard when offline.
 */
const OfflineBanner = ({ isOffline, onGoOnline }) => {
  if (!isOffline) return null;

  return (
    <div className="bg-secondaryYellow text-blackCustom px-4 py-2.5 flex items-center justify-between gap-2 text-secondaryText">
      <div className="flex items-center gap-2 min-w-0">
        <WifiOff className="w-4 h-4 shrink-0" strokeWidth={2} />
        <span className="truncate">Offline Mode – Data will sync when online</span>
      </div>
      <button
        type="button"
        onClick={onGoOnline}
        className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blackCustom text-whiteCustom text-smallText font-medium"
      >
        <Wifi className="w-3.5 h-3.5" />
        Go Online
      </button>
    </div>
  );
};

export default OfflineBanner;
