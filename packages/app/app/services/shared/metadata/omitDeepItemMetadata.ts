import type { ItemMetadata } from "#shared/models/entity/ItemMetadata";
import type { RecursiveDeepOmitItemMetadata } from "#shared/util/types/RecursiveDeepOmitItemMetadata";
import type { RecursiveKeyOf } from "#shared/util/types/RecursiveKeyOf";

import { omitDeep } from "@/util/object/omitDeep";

export const omitDeepItemMetadata = <T extends ItemMetadata, TKeys extends Exclude<RecursiveKeyOf<T>, "updatedAt">[]>(
  itemMetadata: T,
  ...keys: TKeys
) => omitDeep(itemMetadata, ...keys, "updatedAt" as RecursiveKeyOf<T>) as RecursiveDeepOmitItemMetadata<T, TKeys>;
