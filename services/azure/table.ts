import type { CompositeKey } from "@/models/azure";
import type { AzureTable } from "@/models/azure/table";
import type { GetTableEntityOptions, TableEntityQueryOptions } from "@azure/data-tables";
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

const jsonSerializer = new JsonSerializer();

export const getEntity = async <Entity extends CompositeKey>(
  tableClient: TableClient,
  partitionKey: string,
  rowKey: string,
  type: Type<Entity>,
  options?: GetTableEntityOptions
): Promise<Entity> => {
  const result = await tableClient.getEntity<Entity>(partitionKey, rowKey, options);
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
