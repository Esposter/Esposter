import { type AzureUpdateEntity, type CompositeKey } from "@/models/azure";
import { type AzureTable, type AzureTableEntityMap, type CustomTableClient } from "@/models/azure/table";
import { dayjs } from "@/services/dayjs";
import { now } from "@/util/now";
import { type TupleSlice } from "@/util/types/TupleSlice";
import { TableClient, type TableEntity, type TableEntityQueryOptions } from "@azure/data-tables";
import { plainToInstance, type ClassConstructor } from "class-transformer";

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
  cls: ClassConstructor<TEntity>,
  ...args: Parameters<CustomTableClient<TEntity>["getEntity"]>
): Promise<TEntity | null> => {
  try {
    const result = await tableClient.getEntity<TEntity>(...args);
    return plainToInstance(cls, result);
  } catch {
    return null;
  }
};

export const getTopNEntities = async <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<TEntity>,
  topN: number,
  cls: ClassConstructor<TEntity>,
  queryOptions?: TableEntityQueryOptions,
): Promise<TEntity[]> => {
  const listResults = tableClient.listEntities<TEntity>({ queryOptions });
  const iterator = listResults.byPage({ maxPageSize: topN });
  // Take the first page as the topEntries result
  // This only sends a single request to the service
  const firstPage = (await iterator.next()).value as (TEntity | string)[];
  if (!firstPage) return [];
  // Filter out metadata like continuation token
  // before deserializing the json to handle transforming Date objects
  return plainToInstance(cls, firstPage.slice(0, topN));
};

// Crazy big timestamps for calculating reverse-ticked timestamps.
// It also indicates how long before azure table storage
// completely ***ks up trying to insert a negative partition / row key
export const AZURE_SELF_DESTRUCT_TIMER = "9".repeat(30);
export const AZURE_SELF_DESTRUCT_TIMER_SMALL = "9".repeat(15);
export const AZURE_MAX_BATCH_SIZE = 100;
export const AZURE_MAX_PAGE_SIZE = 1000;

export const getReverseTickedDay = (createdAt: Date) =>
  (BigInt(AZURE_SELF_DESTRUCT_TIMER_SMALL) - BigInt(dayjs(createdAt).format("YYYYMMDD"))).toString();

// Reverse-ticked timestamp in nanoseconds
export const getReverseTickedTimestamp = () => (BigInt(AZURE_SELF_DESTRUCT_TIMER) - BigInt(now())).toString();
