import type { TableDeleteEntityHeaders } from "@azure/data-tables";
import type { AzureEntity, CustomTableClient } from "@esposter/db-schema";

export const deleteEntity = <TEntity extends AzureEntity>(
  tableClient: CustomTableClient<TEntity>,
  ...args: Parameters<CustomTableClient<TEntity>["deleteEntity"]>
): Promise<TableDeleteEntityHeaders> => tableClient.deleteEntity(...args);
