export default function AlertCard({ variant = "warning", title, message, actionLabel, onAction }) {
  const variants = {
    warning: "bg-secondaryPink text-pink-900",
    info: "bg-neutral1 text-purplePrimary",
    success: "bg-secondaryGreen text-green-900",
  };

  return (
    <div className={`rounded-2xl p-5 flex items-start gap-4 ${variants[variant]}`}>
      <div className="w-10 h-10 rounded-lg bg-whiteCustom/40 flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <div className="flex-1">
        {title && <h3 className="font-bold text-heading mb-1">{title}</h3>}
        {message && <p className="text-secondaryText opacity-90">{message}</p>}
      </div>
      {actionLabel && (
        <button onClick={onAction} className="bg-whiteCustom text-blackCustom text-secondaryText font-medium px-4 py-2 rounded-lg">
          {actionLabel}
        </button>
      )}
    </div>
  );
}