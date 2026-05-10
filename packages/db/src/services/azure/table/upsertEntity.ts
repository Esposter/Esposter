import type { TableMergeEntityHeaders } from "@azure/data-tables";
import type { CompositeKey, CustomTableClient } from "@esposter/db-schema";
import type { TupleSlice } from "@esposter/shared";

import { serializeEntity } from "@/services/azure/transformer/serializeEntity";

export const upsertEntity = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  entity: TEntity,
  ...args: TupleSlice<Parameters<CustomTableClient<TEntity>["upsertEntity"]>, 1>
): Promise<TableMergeEntityHeaders> => {
  const serializedEntity = serializeEntity(entity);
  return tableClient.upsertEntity(serializedEntity, ...args);
};
