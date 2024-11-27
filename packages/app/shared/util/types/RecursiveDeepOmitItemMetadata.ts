import type { ItemMetadata } from "@/shared/models/entity/ItemMetadata";
import type { RecursiveDeepOmit } from "@/shared/util/types/RecursiveDeepOmit";
import type { RecursiveKeyOf } from "@/shared/util/types/RecursiveKeyOf";

export type RecursiveDeepOmitItemMetadata<
  T extends ItemMetadata,
  TKeys extends RecursiveKeyOf<T>[] = [],
> = RecursiveDeepOmit<T, [...TKeys, "updatedAt"]>;
