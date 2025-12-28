import type { AzureEntity, AzureUpdateEntity, CustomTableClient } from "@esposter/db-schema";
import type { TupleSlice } from "@esposter/shared";

import { serializeEntity } from "@/services/azure/transformer/serializeEntity";

export const updateEntity = <TEntity extends AzureEntity>(
  tableClient: CustomTableClient<TEntity>,
  entity: AzureUpdateEntity<TEntity>,
  ...args: TupleSlice<Parameters<CustomTableClient<TEntity>["updateEntity"]>, 1>
) => {
  entity.updatedAt = new Date();
  const serializedEntity = serializeEntity(entity);
  return tableClient.updateEntity(serializedEntity, ...args);
};
