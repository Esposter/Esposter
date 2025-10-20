import type { AzureEntity, CustomTableClient } from "@esposter/db-schema";

export const deleteEntity = <TEntity extends AzureEntity>(
  tableClient: CustomTableClient<TEntity>,
  ...args: Parameters<CustomTableClient<TEntity>["deleteEntity"]>
) => tableClient.deleteEntity(...args);
