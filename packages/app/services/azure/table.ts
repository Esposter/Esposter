import type { AzureUpdateEntity, CompositeKey } from "@/models/azure";
import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@/models/azure/table";
import type { TableEntity, TableEntityQueryOptions } from "@azure/data-tables";
import type { TupleSlice } from "@esposter/shared";
import type { Constructor } from "type-fest";

import { AZURE_SELF_DESTRUCT_TIMER, AZURE_SELF_DESTRUCT_TIMER_SMALL } from "@/services/azure/constants";
import { dayjs } from "@/services/dayjs";
import { now } from "@/util/time/now";
import { TableClient } from "@azure/data-tables";
import { plainToInstance } from "class-transformer";

const runtimeConfig = useRuntimeConfig();

export const getTableClient = async <TAzureTable extends AzureTable>(
  tableName: TAzureTable,
): Promise<CustomTableClient<AzureTableEntityMap[TAzureTable]>> => {
  const tableClient = TableClient.fromConnectionString(runtimeConfig.azure.storageAccountConnectionString, tableName);
  try {
    await tableClient.createTable();
    return tableClient as CustomTableClient<AzureTableEntityMap[TAzureTable]>;
  } catch {
    return tableClient as CustomTableClient<AzureTableEntityMap[TAzureTable]>;
  }
};

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

export const deleteEntity = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  ...args: Parameters<CustomTableClient<TEntity>["deleteEntity"]>
) => {
  return tableClient.deleteEntity(...args);
};

export const getEntity = async <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  cls: Constructor<TEntity>,
  ...args: Parameters<CustomTableClient<TEntity>["getEntity"]>
): Promise<TEntity | undefined> => {
  try {
    const entity = await tableClient.getEntity<TEntity>(...args);
    return plainToInstance(cls, entity);
  } catch {
    return undefined;
  }
};

export const getTopNEntities = async <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  topN: number,
  cls: Constructor<TEntity>,
  queryOptions?: TableEntityQueryOptions,
): Promise<TEntity[]> => {
  const listResults = tableClient.listEntities<TEntity>({ queryOptions });
  const iterator = listResults.byPage({ maxPageSize: topN });

  for await (const page of iterator) {
    // Filter out metadata like continuation token before deserializing the json
    // Take the first page as the topEntries result
    // This only sends a single request to the service
    return plainToInstance(cls, page.slice(0, topN));
  }

  return [];
};

export const getReverseTickedDay = (createdAt: Date) =>
  (BigInt(AZURE_SELF_DESTRUCT_TIMER_SMALL) - BigInt(dayjs(createdAt).format("YYYYMMDD"))).toString();

// Reverse-ticked timestamp in nanoseconds
export const getReverseTickedTimestamp = () => (BigInt(AZURE_SELF_DESTRUCT_TIMER) - BigInt(now())).toString();
