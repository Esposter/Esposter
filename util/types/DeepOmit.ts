import { type DeepOmitArray } from "@/util/types/DeepOmitArray";

// Union of primitives to skip with deep omit utilities
type Primitive = string | Function | number | boolean | symbol | undefined | null;

export type DeepOmit<T, TKey> = T extends Primitive
  ? T
  : {
      // Extra level of indirection needed to trigger homomorhic behavior
      // Distribute over unions
      [P in Exclude<keyof T, TKey>]: T[P] extends infer TP
        ? TP extends Primitive
          ? // Leave primitives and functions alone
            TP
          : TP extends unknown[]
            ? // Array special handling
              DeepOmitArray<TP, TKey>
            : DeepOmit<TP, TKey>
        : never;
    };
