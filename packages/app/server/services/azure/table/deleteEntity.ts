import type { CompositeKey } from "#shared/models/azure/CompositeKey";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";

export const deleteEntity = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  ...args: Parameters<CustomTableClient<TEntity>["deleteEntity"]>
) => {
  return tableClient.deleteEntity(...args);
};
