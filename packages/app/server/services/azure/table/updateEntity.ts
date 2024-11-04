import type { AzureUpdateEntity, CompositeKey } from "@/models/azure";
import type { CustomTableClient } from "@/models/azure/table";
import type { TableEntity } from "@azure/data-tables";
import type { TupleSlice } from "@esposter/shared";

export const updateEntity = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  ...args: [AzureUpdateEntity<TEntity>, ...TupleSlice<Parameters<CustomTableClient<TEntity>["updateEntity"]>, 1>]
) => {
  const [entity, ...rest] = args;
  const serializedEntity = Object.fromEntries(
    Object.entries(entity).map(([prop, value]) => {
      if (Array.isArray(value)) return [prop, JSON.stringify(value)];
      else return [prop, value];
    }),
  ) as TableEntity;
  return tableClient.updateEntity(serializedEntity, ...rest);
};
