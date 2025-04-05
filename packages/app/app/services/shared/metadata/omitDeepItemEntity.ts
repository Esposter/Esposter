import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { RecursiveDeepOmitItemEntity } from "#shared/util/types/RecursiveDeepOmitItemEntity";
import type { RecursiveKeyOf } from "#shared/util/types/RecursiveKeyOf";

import { omitDeep } from "@/util/object/omitDeep";

export const omitDeepItemEntity = <
  T extends AItemEntity,
  TKeys extends Exclude<RecursiveKeyOf<T>, "toJSON" | "updatedAt">[],
>(
  itemMetadata: T,
  ...keys: [...TKeys]
) =>
  omitDeep(
    itemMetadata,
    ...keys,
    "updatedAt" as RecursiveKeyOf<T>,
    "toJSON" as RecursiveKeyOf<T>,
  ) as RecursiveDeepOmitItemEntity<T, TKeys>;
