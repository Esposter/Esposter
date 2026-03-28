import type { TupleSplit } from "@/util/types/TupleSplit";

export type TupleSplitTail<T extends unknown[], N extends number> = TupleSplit<T, N>[1];
