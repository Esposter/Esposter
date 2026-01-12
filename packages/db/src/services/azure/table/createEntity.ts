import type { TableInsertEntityHeaders } from "@azure/data-tables";
import type { CompositeKey, CustomTableClient } from "@esposter/db-schema";
import type { TupleSlice } from "@esposter/shared";

import { serializeEntity } from "@/services/azure/transformer/serializeEntity";

export const createEntity = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  entity: TEntity,
  ...args: TupleSlice<Parameters<CustomTableClient<TEntity>["createEntity"]>, 1>
): Promise<TableInsertEntityHeaders> => {
  const serializedEntity = serializeEntity(entity);
  return tableClient.createEntity(serializedEntity, ...args);
};
