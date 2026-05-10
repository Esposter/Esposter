import type { AItemEntity, AItemEntityPropertyNames } from "#shared/models/entity/AItemEntity";
import type { AzureEntity, CompositeKeyPropertyNames } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

export type EntityIdKeys<TEntity extends object> =
  TEntity extends ToData<AItemEntity>
    ? [typeof AItemEntityPropertyNames.id]
    : TEntity extends ToData<AzureEntity>
      ? [typeof CompositeKeyPropertyNames.partitionKey, typeof CompositeKeyPropertyNames.rowKey]
      : (keyof TEntity & string)[];
