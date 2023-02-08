import type { AzureUpdateEntity, CompositeKey } from "@/models/azure";
import type { AzureTable } from "@/models/azure/table";
import type { SkipFirst } from "@/utils/types";
import type { TableEntity, TableEntityQueryOptions } from "@azure/data-tables";
import { TableClient } from "@azure/data-tables";
import { JsonSerializer } from "typescript-json-serializer";
import type { Type } from "typescript-json-serializer/dist/helpers";

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

const jsonSerializer = new JsonSerializer();

export const getEntity = async <Entity extends CompositeKey>(
  tableClient: TableClient,
  type: Type<Entity>,
  ...args: Parameters<InstanceType<typeof TableClient>["getEntity"]>
): Promise<Entity> => {
  const result = await tableClient.getEntity<Entity>(...args);
  return jsonSerializer.deserialize<Entity>(result, type) as Entity;
};

export const getTopNEntities = async <Entity extends CompositeKey>(
  tableClient: TableClient,
  topN: number,
  type: Type<Entity>,
  queryOptions?: TableEntityQueryOptions
): Promise<Entity[]> => {
  const listResults = tableClient.listEntities<Entity>({ queryOptions });
  const iterator = listResults.byPage({ maxPageSize: topN });
  // Take the first page as the topEntries result
  // This only sends a single request to the service
  const firstPage = (await iterator.next()).value as (Entity | string)[];
  if (!firstPage) return [];
  return firstPage.slice(0, topN - 1) as Entity[];
  // @NOTE: Fix this when ES decorators are implemented
  // Filter out metadata like continuation token
  // before deserializing the json to handle transforming Date objects
  // return jsonSerializer.deserializeObjectArray<Entity>(firstPage.slice(0, topN - 1), type) as Entity[];
};
