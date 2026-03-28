import type { DeepOmit } from "@/util/types/DeepOmit";

export type DeepOmitArray<TArray extends unknown[], TKey> = TArray extends [infer Head, ...infer Tail]
  ? [DeepOmit<Head, TKey>, ...DeepOmitArray<Tail, TKey>]
  : TArray extends []
    ? []
    : Array<DeepOmit<TArray[number], TKey>>;
