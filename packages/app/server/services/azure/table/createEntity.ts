import type { CompositeKey } from "@/models/azure";
import type { CustomTableClient } from "@/models/azure/table";
import type { TableEntity } from "@azure/data-tables";
import type { TupleSlice } from "@esposter/shared";

export const createEntity = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  ...args: [TEntity, ...TupleSlice<Parameters<CustomTableClient<TEntity>["createEntity"]>, 1>]
) => {
  const [entity, ...rest] = args;
  const serializedEntity = Object.fromEntries(
    Object.entries(entity).map(([prop, value]) => {
      if (Array.isArray(value)) return [prop, JSON.stringify(value)];
      else return [prop, value];
    }),
  ) as TableEntity;
  return tableClient.createEntity(serializedEntity, ...rest);
};
