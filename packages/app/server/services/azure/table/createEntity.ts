import type { CompositeKey } from "#shared/models/azure/CompositeKey";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";
import type { TupleSlice } from "@esposter/shared";

import { serializeEntity } from "@@/server/services/azure/transformer/serializeEntity";

export const createEntity = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  ...args: [TEntity, ...TupleSlice<Parameters<CustomTableClient<TEntity>["createEntity"]>, 1>]
) => {
  const [entity, ...rest] = args;
  const serializedEntity = serializeEntity(entity);
  return tableClient.createEntity(serializedEntity, ...rest);
};
