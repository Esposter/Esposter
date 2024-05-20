import type { DeepOmit } from "@/util/types/DeepOmit";

export type DeepOmitArray<TArray extends unknown[], TKey> = {
  [P in keyof TArray]: DeepOmit<TArray[P], TKey>;
};
