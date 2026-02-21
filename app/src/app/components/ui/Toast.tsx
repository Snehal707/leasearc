"use client";

import { useEffect, useState } from "react";

export function Toast({
  message,
  variant = "default",
  explorerLink,
  onDismiss,
  duration = 5000,
}: {
  message: string;
  variant?: "default" | "success" | "pending" | "error";
  explorerLink?: { href: string; label: string };
  onDismiss?: () => void;
  duration?: number;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration <= 0) return;
    const t = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onDismiss]);

  if (!visible) return null;

  const styles = {
    default: "bg-zinc-800 text-white",
    success: "bg-green-600 text-white",
    pending: "bg-amber-600 text-white",
    error: "bg-red-600 text-white",
  };

  return (
    <div
      role="status"
      className={`fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2 rounded-lg px-4 py-3 shadow-lg ${styles[variant]}`}
    >
      <p className="text-sm font-medium">{message}</p>
      {explorerLink && (
        <a
          href={explorerLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm underline opacity-90 hover:opacity-100"
        >
          {explorerLink.label}
        </a>
      )}
      {onDismiss && (
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            onDismiss();
          }}
          className="absolute right-2 top-2 rounded p-1 opacity-80 hover:opacity-100"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
