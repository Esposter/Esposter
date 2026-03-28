import type { DeepOmitByPath } from "#shared/util/types/DeepOmitByPath";

export type RecursiveDeepOmit<T extends object, TKeys extends PropertyKey[]> = TKeys extends [
  infer TKey,
  ...infer TRest,
]
  ? TKey extends PropertyKey
    ? TRest extends PropertyKey[]
      ? RecursiveDeepOmit<DeepOmitByPath<T, TKey>, TRest>
      : DeepOmitByPath<T, TKey>
    : T
  : T;
