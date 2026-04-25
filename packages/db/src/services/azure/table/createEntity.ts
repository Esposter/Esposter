import type { OperationOptions } from "@azure/core-client";
import type { TableInsertEntityHeaders } from "@azure/data-tables";
import type { CompositeKey, CustomTableClient } from "@esposter/db-schema";

import { serializeEntity } from "@/services/azure/transformer/serializeEntity";

export const createEntity = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  entity: TEntity,
  options?: OperationOptions,
): Promise<TableInsertEntityHeaders> => {
  const serializedEntity = serializeEntity(entity);
  return tableClient.createEntity(serializedEntity, options);
};
