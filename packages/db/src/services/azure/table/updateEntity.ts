import type { AzureEntity } from "@/models/azure/table/AzureEntity";
import type { AzureUpdateEntity } from "@/models/azure/table/AzureUpdateEntity";
import type { CustomTableClient } from "@/models/azure/table/CustomTableClient";
import type { TupleSlice } from "@esposter/shared";

import { serializeEntity } from "@/services/azure/transformer/serializeEntity";

export const updateEntity = <TEntity extends AzureEntity>(
  tableClient: CustomTableClient<TEntity>,
  entity: AzureUpdateEntity<TEntity>,
  ...args: TupleSlice<Parameters<CustomTableClient<TEntity>["updateEntity"]>, 1>
) => {
  entity.updatedAt = new Date();
  const serializedEntity = serializeEntity(entity);
  return tableClient.updateEntity(serializedEntity, ...args);
};
