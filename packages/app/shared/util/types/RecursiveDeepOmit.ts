import type { DeepOmit, DeepOmitArray } from "@esposter/shared";

export type RecursiveDeepOmit<T extends object, TKeys extends PropertyKey[]> = TKeys extends [
  infer TKey,
  ...infer TKeysRemaining,
]
  ? TKeysRemaining extends PropertyKey[]
    ? T extends unknown[]
      ? RecursiveDeepOmit<DeepOmitArray<T, TKey>, TKeysRemaining>
      : RecursiveDeepOmit<DeepOmit<T, TKey>, TKeysRemaining>
    : T
  : T;
