"use client";

export function NameSearchBar({
  value,
  onChange,
  onSearch,
  status,
  placeholder = "Search for a name...",
}: {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  status?: "idle" | "loading" | "available" | "rented" | "error";
  placeholder?: string;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="relative flex w-full flex-1 items-center rounded-xl border border-blue-400/20 bg-[#0B101F]/60 p-1.5 shadow-[0_0_30px_rgba(59,130,246,0.15)] backdrop-blur-xl">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="w-full flex-1 bg-transparent px-5 py-3 text-lg text-white outline-none placeholder:text-slate-400/80"
          aria-label="Domain name search"
        />
        <button
          type="button"
          onClick={onSearch}
          className="btn-glow-pulse absolute right-1.5 rounded-lg bg-gradient-to-b from-[#4A90E2] to-[#2B60D4] px-8 py-3 font-medium text-white transition-all duration-200 hover:from-[#5BA0F2] hover:to-[#3C71E5] focus:outline-none focus:ring-2 focus:ring-[#258cf4] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        >
          Check
        </button>
      </div>
      {status === "loading" && (
        <p className="text-sm text-slate-300">Checking Arc Testnet…</p>
      )}
    </div>
  );
}
