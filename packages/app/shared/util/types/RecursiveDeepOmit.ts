import type { DeepOmit } from "@/shared/util/types/DeepOmit";
import type { DeepOmitArray } from "@/shared/util/types/DeepOmitArray";

export type RecursiveDeepOmit<T extends object, TKeys extends string[]> = TKeys extends [
  infer TKey,
  ...infer TKeysRemaining,
]
  ? TKeysRemaining extends string[]
    ? T extends unknown[]
      ? RecursiveDeepOmit<DeepOmitArray<T, TKey>, TKeysRemaining>
      : RecursiveDeepOmit<DeepOmit<T, TKey>, TKeysRemaining>
    : T
  : T;
