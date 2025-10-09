import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";
import type { AzureEntity } from "@esposter/shared";

export const deleteEntity = <TEntity extends AzureEntity>(
  tableClient: CustomTableClient<TEntity>,
  ...args: Parameters<CustomTableClient<TEntity>["deleteEntity"]>
) => tableClient.deleteEntity(...args);
