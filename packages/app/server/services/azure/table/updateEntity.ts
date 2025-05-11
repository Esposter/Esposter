import type { AzureEntity } from "#shared/models/azure/AzureEntity";
import type { AzureUpdateEntity } from "#shared/models/azure/AzureUpdateEntity";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";
import type { TupleSlice } from "@esposter/shared";

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
