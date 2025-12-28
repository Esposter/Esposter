import type { DeepOmitArray } from "@/util/types/DeepOmitArray";
import type { Primitive } from "type-fest";
// https://stackoverflow.com/questions/55539387/deep-omit-with-typescript
export type DeepOmit<T, TKey> = T extends Primitive
  ? T
  : {
      // Extra level of indirection needed to trigger homomorhic behavior
      // Distribute over unions
      [P in Exclude<keyof T, TKey>]: T[P] extends infer TP
        ? TP extends Date | Function | Primitive
          ? // Leave dates, primitives and functions alone
            TP
          : TP extends unknown[]
            ? // Array special handling
              DeepOmitArray<TP, TKey>
            : // Stop recursion for exactly Record<string, unknown>
              Record<string, unknown> extends TP
              ? // Keep it as is
                TP
              : DeepOmit<TP, TKey>
        : never;
    };
