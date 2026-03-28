import type { DeepOmit } from "@esposter/shared";

export type RecursiveDeepOmit<T extends object, TKeys extends PropertyKey[]> = TKeys extends [
  infer TKey,
  ...infer TKeysRemaining,
]
  ? TKeysRemaining extends PropertyKey[]
    ? RecursiveDeepOmit<DeepOmit<T, TKey> & object, TKeysRemaining>
    : T
  : T;
