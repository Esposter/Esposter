import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { RecursiveDeepOmit } from "#shared/util/types/RecursiveDeepOmit";
import type { RecursiveKeyOf } from "#shared/util/types/RecursiveKeyOf";

export type RecursiveDeepOmitItemEntity<
  T extends AItemEntity,
  TKeys extends RecursiveKeyOf<T>[] = [],
> = RecursiveDeepOmit<T, [...TKeys, "updatedAt", "toJSON"]>;
