import type { TupleSplit } from "@/utils/types/TupleSplit";

export type SkipFirst<T extends unknown[], N extends number> = TupleSplit<T, N>[1];
