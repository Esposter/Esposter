import type { AzureEntity } from "#shared/models/azure/AzureEntity";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";

export const deleteEntity = <TEntity extends AzureEntity>(
  tableClient: CustomTableClient<TEntity>,
  ...args: Parameters<CustomTableClient<TEntity>["deleteEntity"]>
) => {
  return tableClient.deleteEntity(...args);
};
