import type { TableUpdateEntityHeaders } from "@azure/data-tables";
import type { AzureEntity, AzureUpdateEntity, CustomTableClient } from "@esposter/db-schema";
import type { ArrayTail } from "type-fest";

import { serializeEntity } from "#src/services/azure/transformer/serializeEntity";

export const updateEntity = <TEntity extends AzureEntity>(
  tableClient: CustomTableClient<TEntity>,
  entity: AzureUpdateEntity<TEntity>,
  ...args: ArrayTail<Parameters<CustomTableClient<TEntity>["updateEntity"]>>
): Promise<TableUpdateEntityHeaders> => {
  entity.updatedAt = new Date();
  const serializedEntity = serializeEntity(entity);
  return tableClient.updateEntity(serializedEntity, ...args);
};
