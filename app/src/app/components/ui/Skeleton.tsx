"use client";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-zinc-700 ${className}`}
      aria-hidden
    />
  );
}

export function SearchResultSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 card-glow">
        <Skeleton className="mb-3 h-6 w-32 bg-white/10" />
        <Skeleton className="mb-2 h-5 w-24 bg-white/10" />
        <Skeleton className="h-4 w-full bg-white/10" />
        <Skeleton className="mt-2 h-4 w-3/4 bg-white/10" />
      </div>
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 card-glow">
        <Skeleton className="mb-3 h-5 w-28 bg-white/10" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-16 bg-white/10" />
          <Skeleton className="h-9 w-16 bg-white/10" />
          <Skeleton className="h-9 w-16 bg-white/10" />
          <Skeleton className="h-9 w-16 bg-white/10" />
        </div>
        <Skeleton className="mt-4 h-10 w-full bg-white/10" />
      </div>
    </div>
  );
}
