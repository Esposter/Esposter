import type { AEntity } from "#shared/models/entity/AEntity";
import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { AzureEntity, ToData } from "@esposter/shared";

export type EntityIdKeys<TEntity extends ToData<AEntity>> =
  TEntity extends ToData<AItemEntity>
    ? ["id"]
    : TEntity extends ToData<AzureEntity>
      ? ["partitionKey", "rowKey"]
      : never;
