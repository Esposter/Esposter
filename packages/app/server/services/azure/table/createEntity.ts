import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";
import type { TupleSlice } from "@esposter/shared";

import { CompositeKey } from "#shared/models/azure/CompositeKey";
import { serializeEntity } from "@@/server/services/azure/transformer/serializeEntity";

export const createEntity = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  entity: TEntity,
  ...args: TupleSlice<Parameters<CustomTableClient<TEntity>["createEntity"]>, 1>
) => {
  const serializedEntity = serializeEntity(entity);
  return tableClient.createEntity(serializedEntity, ...args);
};
