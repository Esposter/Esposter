import type { DeepOmitByPath } from "#shared/util/types/DeepOmitByPath";

export type RecursiveDeepOmit<T extends object, TKeys extends string[]> = TKeys extends [infer TKey, ...infer TRest]
  ? TKey extends string
    ? TRest extends string[]
      ? RecursiveDeepOmit<DeepOmitByPath<T, TKey>, TRest>
      : DeepOmitByPath<T, TKey>
    : T
  : T;
