import type { TableEntityQueryOptions, TransactionAction } from "@azure/data-tables";
import { TableClient } from "@azure/data-tables";
import { parse } from "superjson";
import { AZURE_MAX_BATCH_SIZE } from "@/util/constants.server";
import { AzureTable } from "@/services/azure/types";

export const getTableClient = async (tableName: AzureTable) => {
  const tableClient = TableClient.fromConnectionString(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING, tableName);
  try {
    await tableClient.createTable();
    return tableClient;
  } catch {
    return tableClient;
  }
};

export const getTopNEntities = async <Entity extends object>(
  tableClient: TableClient,
  topN: number,
  queryOptions?: TableEntityQueryOptions
): Promise<Entity[]> => {
  const listResults = tableClient.listEntities<Entity>({ queryOptions });
  const iterator = listResults.byPage({ maxPageSize: topN });
  // Take the first page as the topEntries result
  // This only sends a single request to the service
  // Parse json to handle transforming Date objects
  return parse<Entity[]>((await iterator.next()).value) ?? [];
};

export const submitTransaction = async (
  tableClient: TableClient,
  ...args: Parameters<typeof tableClient["submitTransaction"]>
) => {
  const response = await tableClient.submitTransaction(...args);
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
