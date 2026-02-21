"use client";

export function RecordsForm({
  primary,
  website,
  socials,
  onPrimaryChange,
  onWebsiteChange,
  onSocialsChange,
  onSave,
  isSaving,
  validation,
}: {
  primary: string;
  website: string;
  socials: string;
  onPrimaryChange: (v: string) => void;
  onWebsiteChange: (v: string) => void;
  onSocialsChange: (v: string) => void;
  onSave: () => void;
  isSaving: boolean;
  validation?: { primary?: string; website?: string };
}) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800/80 p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-white">Records</h2>
      <p className="mt-0.5 text-xs text-zinc-500">Primary wallet, website, X / Farcaster</p>
      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-zinc-400">Primary wallet</label>
          <input
            type="text"
            placeholder="0x…"
            value={primary}
            onChange={(e) => onPrimaryChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
          />
          {validation?.primary && <p className="mt-0.5 text-xs text-amber-400">{validation.primary}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400">Website</label>
          <input
            type="text"
            placeholder="https://…"
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-400">X / Farcaster link</label>
          <input
            type="text"
            placeholder="https://…"
            value={socials}
            onChange={(e) => onSocialsChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
          />
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-zinc-800 disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
