"use client";

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDark?: boolean;
}

export default function ConfirmModal({ message, onConfirm, onCancel, isDark }: ConfirmModalProps) {
  const card = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e5e7eb";
  const textPrimary = isDark ? "#f1f5f9" : "#111827";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onCancel}
    >
      <div
        style={{ backgroundColor: card, border: `1px solid ${border}` }}
        className="rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ color: textPrimary }} className="text-base font-semibold mb-2">
          Delete document
        </h3>
        <p style={{ color: textSecondary }} className="text-sm mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            style={{ color: textSecondary, border: `1px solid ${border}` }}
            className="px-4 py-2 rounded-lg text-sm transition hover:opacity-70"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}