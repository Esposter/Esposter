import type { AzureUpdateEntity, CompositeKey } from "@/models/azure";
import type { AzureTable } from "@/models/azure/table";
import { now } from "@/utils/time";
import type { SkipFirst } from "@/utils/types";
import { TableClient, TableEntity, TableEntityQueryOptions } from "@azure/data-tables";
import type { ClassConstructor } from "class-transformer";
import { plainToInstance } from "class-transformer";
import dayjs from "dayjs";

export const getTableClient = async (tableName: AzureTable) => {
  const tableClient = TableClient.fromConnectionString(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING, tableName);
  try {
    await tableClient.createTable();
    return tableClient;
  } catch {
    return tableClient;
  }
};

export const createEntity = <Entity extends CompositeKey>(
  tableClient: TableClient,
  ...args: [Entity, ...SkipFirst<Parameters<InstanceType<typeof TableClient>["createEntity"]>, 1>]
) => {
  const [entity, ...rest] = args;
  const serializedEntity = Object.fromEntries(
    Object.entries(entity).map(([prop, value]) => {
      if (Array.isArray(value)) return [prop, JSON.stringify(value)];
      else return [prop, value];
    })
  ) as TableEntity;
  return tableClient.createEntity(serializedEntity, ...rest);
};

export const updateEntity = <Entity extends CompositeKey>(
  tableClient: TableClient,
  ...args: [AzureUpdateEntity<Entity>, ...SkipFirst<Parameters<InstanceType<typeof TableClient>["updateEntity"]>, 1>]
) => {
  const [entity, ...rest] = args;
  const serializedEntity = Object.fromEntries(
    Object.entries(entity).map(([prop, value]) => {
      if (Array.isArray(value)) return [prop, JSON.stringify(value)];
      else return [prop, value];
    })
  ) as TableEntity;
  return tableClient.updateEntity(serializedEntity, ...rest);
};

export const deleteEntity = (
  tableClient: TableClient,
  ...args: Parameters<InstanceType<typeof TableClient>["deleteEntity"]>
) => {
  return tableClient.deleteEntity(...args);
};

export const getEntity = async <Entity extends CompositeKey>(
  tableClient: TableClient,
  cls: ClassConstructor<Entity>,
  ...args: Parameters<InstanceType<typeof TableClient>["getEntity"]>
): Promise<Entity> => {
  const result = await tableClient.getEntity<Entity>(...args);
  return plainToInstance(cls, result);
};

export const getTopNEntities = async <Entity extends CompositeKey>(
  tableClient: TableClient,
  topN: number,
  cls: ClassConstructor<Entity>,
  queryOptions?: TableEntityQueryOptions
): Promise<Entity[]> => {
  const listResults = tableClient.listEntities<Entity>({ queryOptions });
  const iterator = listResults.byPage({ maxPageSize: topN });
  // Take the first page as the topEntries result
  // This only sends a single request to the service
  const firstPage = (await iterator.next()).value as (Entity | string)[];
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

export const getMessagesPartitionKey = (roomId: string, createdAt: Date) =>
  `${roomId}-${getReverseTickedDay(createdAt)}`;

export const getMessagesPartitionKeyFilter = (roomId: string) =>
  `PartitionKey gt '${roomId}' and PartitionKey lt '${roomId}😆'`;

export const getReverseTickedDay = (createdAt: Date) =>
  (BigInt(AZURE_SELF_DESTRUCT_TIMER_SMALL) - BigInt(dayjs(createdAt).format("YYYYMMDD"))).toString();

// Reverse-ticked timestamp in nanoseconds
export const getReverseTickedTimestamp = () => (BigInt(AZURE_SELF_DESTRUCT_TIMER) - BigInt(now())).toString();
