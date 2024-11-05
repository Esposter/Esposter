import type { ItemMetadata } from "@/shared/models/itemMetadata";
import type { RecursiveDeepOmitItemMetadata } from "@/util/types/RecursiveDeepOmitItemMetadata";
import type { RecursiveKeyOf } from "@/util/types/RecursiveKeyOf";

import { omitDeep } from "@/util/object/omitDeep";

export const omitDeepItemMetadata = <T extends ItemMetadata, TKeys extends Exclude<RecursiveKeyOf<T>, "updatedAt">[]>(
  itemMetadata: T,
  ...keys: TKeys
) => omitDeep(itemMetadata, ...keys, "updatedAt" as RecursiveKeyOf<T>) as RecursiveDeepOmitItemMetadata<T, TKeys>;
