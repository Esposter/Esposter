import { AzureBlob, AzureTable } from "@/services/azure/types";
import { AZURE_MAX_BATCH_SIZE } from "@/util/constants";
import { TableClient, TableEntityQueryOptions, TableServiceClient, TransactionAction } from "@azure/data-tables";
import { BlobServiceClient } from "@azure/storage-blob";

const runtimeConfig = useRuntimeConfig();

export const blobServiceClient = BlobServiceClient.fromConnectionString(
  runtimeConfig.azureStorageAccountConnectionString
);

export const tableServiceClient = TableServiceClient.fromConnectionString(
  runtimeConfig.azureStorageAccountConnectionString
);

export const getTableClient = async (tableName: AzureTable) => {
  const table = TableClient.fromConnectionString(runtimeConfig.azureStorageAccountConnectionString, tableName);
  try {
    await table.createTable();
    return table;
  } catch {
    return table;
  }
};

export const getBlobClient = async (blobName: AzureBlob) => {
  const blob = blobServiceClient.getContainerClient(blobName);
  await blob.createIfNotExists();
  return blob;
};

export const getTopNEntities = async <Entity extends object>(
  client: TableClient,
  topN: number,
  queryOptions?: TableEntityQueryOptions
): Promise<Entity[]> => {
  const listResults = client.listEntities<Entity>({ queryOptions });
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
 * @param client
 * @param actions
 * @returns True if there is an error. False otherwise.
 */
export const submitTransaction = async (client: TableClient, actions: TransactionAction[]) => {
  if (actions.length === 0) return false;
  const response = await client.submitTransaction(actions);
  const error = response.status >= 400;
  if (error) console.error(`Failed to submit azure table transaction for table ${client.tableName}`);
  return error;
};

export const addActions = async (client: TableClient, actions: TransactionAction[], ...items: TransactionAction[]) => {
  let resultActions = actions;

  for (const item of items) {
    if (resultActions.length === AZURE_MAX_BATCH_SIZE) {
      await submitTransaction(client, resultActions);
      resultActions = [];
    }
    resultActions.push(item);
  }

  return resultActions;
};
