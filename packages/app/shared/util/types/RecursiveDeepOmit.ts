import type { DeepOmitByPath } from "#shared/util/types/DeepOmitByPath";

export type RecursiveDeepOmit<T extends object, TKeys extends readonly PropertyKey[]> = TKeys extends readonly [
  infer TKey,
  ...infer TRest,
]
  ? TKey extends PropertyKey
    ? TRest extends readonly PropertyKey[]
      ? RecursiveDeepOmit<DeepOmitByPath<T, TKey>, TRest>
      : DeepOmitByPath<T, TKey>
    : T
  : T;
