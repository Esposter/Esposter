import type { TupleSplit } from "@/utils/types/TupleSplit";

export type TakeFirst<T extends unknown[], N extends number> = TupleSplit<T, N>[0];
