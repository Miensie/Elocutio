interface ToastProps {
  message: string;
  variant?: "success" | "error" | "info";
  onClose: () => void;
}

const VARIANT_CLASSES = {
  success: "bg-green-50 text-green-800 border-green-200",
  error: "bg-red-50 text-red-800 border-red-200",
  info: "bg-brand-50 text-brand-700 border-brand-100"
};

export function Toast({ message, variant = "info", onClose }: ToastProps) {
  return (
    <div
      className={`fixed bottom-4 right-4 border rounded-lg px-4 py-3 shadow-md text-sm ${VARIANT_CLASSES[variant]}`}
      role="status"
    >
      <div className="flex items-center gap-3">
        <span>{message}</span>
        <button onClick={onClose} className="opacity-60 hover:opacity-100" aria-label="Fermer">
          ✕
        </button>
      </div>
    </div>
  );
}
