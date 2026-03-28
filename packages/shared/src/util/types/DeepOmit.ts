import type { DeepOmitArray } from "@/util/types/DeepOmitArray";
import type { Primitive } from "type-fest";

export type DeepOmit<T, TKey> = T extends Date | Function | Primitive
  ? T
  : Record<string, unknown> extends T
    ? T
    : T extends unknown[]
      ? DeepOmitArray<T, TKey>
      : {
          [P in Exclude<keyof T, TKey>]: DeepOmit<T[P], TKey>;
        };
