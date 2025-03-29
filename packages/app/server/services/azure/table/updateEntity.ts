import type { AzureUpdateEntity } from "#shared/models/azure/AzureUpdateEntity";
import type { CompositeKey } from "#shared/models/azure/CompositeKey";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";
import type { TupleSlice } from "@esposter/shared";

import { serializeEntity } from "@@/server/services/azure/transformer/serializeEntity";

export const updateEntity = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  ...args: [AzureUpdateEntity<TEntity>, ...TupleSlice<Parameters<CustomTableClient<TEntity>["updateEntity"]>, 1>]
) => {
  const [entity, ...rest] = args;
  const serializedEntity = serializeEntity(entity);
  return tableClient.updateEntity(serializedEntity, ...rest);
};
