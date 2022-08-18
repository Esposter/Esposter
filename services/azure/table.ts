import { AzureTable } from "@/services/azure/types";
import { AZURE_MAX_BATCH_SIZE } from "@/util/constants";
import type { TableEntityQueryOptions, TransactionAction } from "@azure/data-tables";
import { TableClient } from "@azure/data-tables";

const runtimeConfig = useRuntimeConfig();

export const getTableClient = async (tableName: AzureTable) => {
  const tableClient = TableClient.fromConnectionString(runtimeConfig.azureStorageAccountConnectionString, tableName);
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

  /**
   * Take the first page as the topEntries result
   * and break to only get the first page.
   * This only sends a single request to the service.
   */
  for await (const page of iterator) return page;

  return [];
};

/**
 *
 * @param tableClient
 * @param args
 * @returns If the transaction was successful.
 */
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
