import type { ItemMetadata } from "@/models/shared/ItemMetadata";
import { omitDeep } from "@/util/object/omitDeep";
import type { RecursiveKeyOf } from "@/util/types/RecursiveKeyOf";

export const omitDeepItemMetadata = <T extends ItemMetadata>(
  itemMetadata: T,
  ...keys: Exclude<RecursiveKeyOf<T>, "updatedAt">[]
) => omitDeep<ItemMetadata>(itemMetadata, ...keys, "updatedAt");
