import type { BuildTuple } from "@/util/types/BuildTuple";

export type TupleSplit<T extends unknown[], N extends number> = T extends [...BuildTuple<N>, ...infer R]
  ? [T extends [...infer H, ...R] ? H : BuildTuple<N, T[number]>, R]
  : [T, []];
