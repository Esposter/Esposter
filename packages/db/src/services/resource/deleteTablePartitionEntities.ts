import type { CompositeKey } from "@esposter/azure";
import type { CustomTableClient } from "@esposter/db-schema";

import { submitTransactionBatches } from "#src/services/azure/table/submitTransactionBatches";
import { AZURE_MAX_PAGE_SIZE, getPartitionKeyFilter } from "@esposter/azure";

// Azure Table has no partition-drop, so clearing a partition means enumerating it and batch-deleting.
// Every page is walked, unlike the capped reads elsewhere: a purge that stopped at the cap would leave
// Rows behind with nothing left to find them by. Already-gone entities are the success case, so a retry is safe.
export const deleteTablePartitionEntities = async (
  tableClient: CustomTableClient<CompositeKey>,
  partitionKey: string,
) => {
  const filter = getPartitionKeyFilter(partitionKey);
  for await (const page of tableClient
    .listEntities<CompositeKey>({ queryOptions: { filter } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    await submitTransactionBatches(tableClient, page, ({ partitionKey: entityPartitionKey, rowKey }) => [
      "delete",
      { partitionKey: entityPartitionKey, rowKey },
    ]);
};
