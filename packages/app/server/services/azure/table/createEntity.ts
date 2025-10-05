import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";
import type { CompositeKey, TupleSlice } from "@esposter/shared";

import { serializeEntity } from "@@/server/services/azure/transformer/serializeEntity";

export const createEntity = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  entity: TEntity,
  ...args: TupleSlice<Parameters<CustomTableClient<TEntity>["createEntity"]>, 1>
) => {
  const serializedEntity = serializeEntity(entity);
  return tableClient.createEntity(serializedEntity, ...args);
};
