import type { ItemMetadata } from "@/models/shared/ItemMetadata";
import type { RecursiveDeepOmit } from "@/util/types/RecursiveDeepOmit";
import type { RecursiveKeyOf } from "@/util/types/RecursiveKeyOf";

export type RecursiveDeepOmitItemMetadata<
  T extends ItemMetadata,
  TKeys extends RecursiveKeyOf<T>[] = [],
> = RecursiveDeepOmit<T, [...TKeys, "updatedAt"]>;
