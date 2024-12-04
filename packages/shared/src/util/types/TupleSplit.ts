import type { TupleSplitHead } from "@/util/types/TupleSplitHead";
import type { TupleSplitTail } from "@/util/types/TupleSplitTail";

// https://stackoverflow.com/questions/67605122/obtain-a-slice-of-a-typescript-parameters-tuple
export type TupleSplit<T extends unknown[], N extends number> = [TupleSplitHead<T, N>, TupleSplitTail<T, N>];
