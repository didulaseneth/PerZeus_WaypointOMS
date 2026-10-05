export default function Modal({ open, onClose, icon, iconColor = "text-green-600", title, message, confirmLabel, onConfirm, variant = "info" }) {
  if (!open) return null;

  if (variant === "confirm") {
    return (
      <div className="fixed inset-0 bg-blackCustom/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-whiteCustom rounded-2xl p-8 w-full max-w-md text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral1 text-purplePrimary flex items-center justify-center">
            ✕
          </button>
          <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-heading text-blackCustom mb-2">{title}</h2>
          <p className="text-secondaryText text-gray6">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-blackCustom/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-whiteCustom rounded-2xl p-8 w-full max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-neutral1 flex items-center justify-center mx-auto mb-4">
          <span className="text-purplePrimary text-title">?</span>
        </div>
        <h2 className="text-heading text-blackCustom mb-2">{title}</h2>
        <p className="text-secondaryText text-gray6 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onConfirm} className="btn-secondary">{confirmLabel || "Yes"}</button>
          <button onClick={onClose} className="btn-primary">No</button>
        </div>
      </div>
    </div>
  );
}