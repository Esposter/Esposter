import type { TableEntityQueryOptions, TransactionAction as AzureTransactionAction } from "@azure/data-tables";
import { TableClient } from "@azure/data-tables";
import { JsonSerializer } from "typescript-json-serializer";
import type { Type } from "typescript-json-serializer/dist/helpers";
import { AZURE_MAX_BATCH_SIZE } from "@/util/constants.server";
import { AzureTable } from "@/services/azure/types";
import type { CompositeKey, TransactionAction } from "@/services/azure/types";

export const getTableClient = async (tableName: AzureTable) => {
  const tableClient = TableClient.fromConnectionString(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING, tableName);
  try {
    await tableClient.createTable();
    return tableClient;
  } catch {
    return tableClient;
  }
};

const jsonSerializer = new JsonSerializer({ additionalPropertiesPolicy: "remove" });

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
  // Filter out metadata like continuation token
  // before deserializing the json to handle transforming Date objects
  return jsonSerializer.deserializeObjectArray<Entity>(firstPage.slice(0, topN - 1), type) as Entity[];
};

export const submitTransaction = async (tableClient: TableClient, actions: TransactionAction[]) => {
  const response = await tableClient.submitTransaction(actions as AzureTransactionAction[]);
  const error = response.status >= 400;
  if (error) console.error(`Failed to submit azure table transaction for table ${tableClient.tableName}`);
  return !error;
};

export const addActions = async (
  tableClient: TableClient,
  actions: TransactionAction[],
  ...items: TransactionAction[]
) => {
  let resultActions = actions;

  for (const item of items) {
    if (resultActions.length === AZURE_MAX_BATCH_SIZE) {
      await submitTransaction(tableClient, resultActions);
      resultActions = [];
    }
    resultActions.push(item);
  }

  return resultActions;
};
