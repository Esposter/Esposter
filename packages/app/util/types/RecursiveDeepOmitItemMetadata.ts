import type { RecursiveDeepOmit } from "@/util/types/RecursiveDeepOmit";
import type { RecursiveKeyOf } from "@/util/types/RecursiveKeyOf";
import type { ItemMetadata } from "~/shared/models/entity/ItemMetadata";

export type RecursiveDeepOmitItemMetadata<
  T extends ItemMetadata,
  TKeys extends RecursiveKeyOf<T>[] = [],
> = RecursiveDeepOmit<T, [...TKeys, "updatedAt"]>;
