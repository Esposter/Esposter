import type { CompositeKey } from "@/models/azure";
import type { CustomTableClient } from "@/models/azure/table";

export const deleteEntity = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  ...args: Parameters<CustomTableClient<TEntity>["deleteEntity"]>
) => {
  return tableClient.deleteEntity(...args);
};
