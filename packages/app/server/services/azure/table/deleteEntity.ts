import type { AzureEntity } from "#shared/models/azure/table/AzureEntity";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";

export const deleteEntity = <TEntity extends AzureEntity>(
  tableClient: CustomTableClient<TEntity>,
  ...args: Parameters<CustomTableClient<TEntity>["deleteEntity"]>
) => tableClient.deleteEntity(...args);
