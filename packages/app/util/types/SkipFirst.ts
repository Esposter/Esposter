import type { TupleSplit } from "@/util/types/TupleSplit";

export type SkipFirst<T extends unknown[], N extends number> = TupleSplit<T, N>[1];
