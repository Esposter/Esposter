import type { CompositeKey } from "@esposter/azure";
import type { CustomTableClient } from "@esposter/db-schema";

import { checkIsNotFound } from "#src/services/azure/error/checkIsNotFound";
import { deleteEntityIfExists } from "#src/services/azure/table/deleteEntityIfExists";
import { submitTransactionBatches } from "#src/services/azure/table/submitTransactionBatches";
import { AZURE_MAX_BATCH_SIZE, AZURE_MAX_PAGE_SIZE, getPartitionKeyFilter } from "@esposter/azure";
import { getResultAsync, noop, settleAll } from "@esposter/shared";

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
    await getResultAsync(() =>
      submitTransactionBatches(tableClient, page, ({ partitionKey: entityPartitionKey, rowKey }) => [
        "delete",
        { partitionKey: entityPartitionKey, rowKey },
      ]),
    ).match(noop, async (error) => {
      if (!checkIsNotFound(error)) throw error;
      // The listing and the batch are separate reads, so a row another delete removed in between fails its batch with
      // A 404 and that batch commits none of its rows. Batches before it may have committed theirs, so the page is
      // Deleted one row at a time, a row already gone counting as deleted, in waves of one transaction's size
      await settleAll(
        page.map((entity) => () => deleteEntityIfExists(tableClient, entity)),
        AZURE_MAX_BATCH_SIZE,
      );
    });
};
