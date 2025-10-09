import type { AzureUpdateEntity } from "#shared/models/azure/table/AzureUpdateEntity";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";
import type { AzureEntity, TupleSlice } from "@esposter/shared";

import { serializeEntity } from "@@/server/services/azure/transformer/serializeEntity";

export const updateEntity = <TEntity extends AzureEntity>(
  tableClient: CustomTableClient<TEntity>,
  entity: AzureUpdateEntity<TEntity>,
  ...args: TupleSlice<Parameters<CustomTableClient<TEntity>["updateEntity"]>, 1>
) => {
  entity.updatedAt = new Date();
  const serializedEntity = serializeEntity(entity);
  return tableClient.updateEntity(serializedEntity, ...args);
};
