import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { AzureEntity } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

export type EntityIdKeys<TEntity extends Record<string, unknown>> =
  TEntity extends ToData<AItemEntity>
    ? ["id"]
    : TEntity extends ToData<AzureEntity>
      ? ["partitionKey", "rowKey"]
      : (keyof TEntity & string)[];
