"use client";

interface AlertModalProps {
  message: string;
  onClose: () => void;
  isDark?: boolean;
}

export default function AlertModal({ message, onClose, isDark }: AlertModalProps) {
  const card = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        style={{ backgroundColor: card, border: `1px solid ${border}` }}
        className="rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: textPrimary }} className="text-base font-semibold mb-2">
          Nothing to process
        </h3>
        <p style={{ color: textSecondary }} className="text-sm mb-6">
          {message}
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}