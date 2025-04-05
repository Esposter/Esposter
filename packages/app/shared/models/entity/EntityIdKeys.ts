import type { AzureEntity } from "#shared/models/azure/AzureEntity";
import type { AEntity } from "#shared/models/entity/AEntity";
import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { ToData } from "#shared/models/entity/ToData";

export type EntityIdKeys<TEntity extends ToData<AEntity>> =
  TEntity extends ToData<AItemEntity>
    ? ["id"]
    : TEntity extends ToData<AzureEntity>
      ? ["partitionKey", "rowKey"]
      : never;
