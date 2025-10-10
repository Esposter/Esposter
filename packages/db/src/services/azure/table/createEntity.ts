import type { CompositeKey } from "@/models/azure/table/CompositeKey";
import type { CustomTableClient } from "@/models/azure/table/CustomTableClient";
import type { TupleSlice } from "@esposter/shared";

import { serializeEntity } from "@/services/azure/transformer/serializeEntity";

export const createEntity = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  entity: TEntity,
  ...args: TupleSlice<Parameters<CustomTableClient<TEntity>["createEntity"]>, 1>
) => {
  const serializedEntity = serializeEntity(entity);
  return tableClient.createEntity(serializedEntity, ...args);
};
