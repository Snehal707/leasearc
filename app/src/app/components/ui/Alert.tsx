"use client";

export function Alert({
  variant = "info",
  children,
  className = "",
}: {
  variant?: "error" | "warning" | "info" | "success";
  children: React.ReactNode;
  className?: string;
}) {
  const styles = {
    error: "border-red-900/50 bg-red-950/50 text-red-300",
    warning: "border-amber-700/50 bg-amber-950/30 text-amber-300",
    info: "border-blue-700/50 bg-blue-950/30 text-blue-300",
    success: "border-green-700/50 bg-green-950/30 text-green-300",
  };
  return (
    <div
      role="alert"
      className={`rounded-lg border p-4 ${styles[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
