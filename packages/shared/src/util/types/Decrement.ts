import type { BuildTuple } from "@/util/types/BuildTuple";

export type Decrement<N extends number> = BuildTuple<N> extends [unknown, ...infer Rest] ? Rest["length"] : never;
