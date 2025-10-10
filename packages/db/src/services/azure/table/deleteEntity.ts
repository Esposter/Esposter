import type { AzureEntity } from "@/models/azure/table/AzureEntity";
import type { CustomTableClient } from "@/models/azure/table/CustomTableClient";

export const deleteEntity = <TEntity extends AzureEntity>(
  tableClient: CustomTableClient<TEntity>,
  ...args: Parameters<CustomTableClient<TEntity>["deleteEntity"]>
) => tableClient.deleteEntity(...args);
