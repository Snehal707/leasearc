"use client";

import dynamic from "next/dynamic";

const Starfield = dynamic(
  () => import("./Starfield").then((mod) => mod.Starfield),
  { ssr: false, loading: () => null }
);

export function LazyStarfield() {
  return <Starfield />;
}
