import type { CompositeKey, CustomTableClient } from "@esposter/db-schema";

import { serializeClauses } from "@/services/azure/transformer/serializeClauses";
import {
  AZURE_MAX_BATCH_SIZE,
  AZURE_MAX_PAGE_SIZE,
  BinaryOperator,
  CompositeKeyPropertyNames,
} from "@esposter/db-schema";

// Azure Table has no partition-drop, so clearing a partition means enumerating it and batch-deleting.
// Every page is walked, unlike the capped reads elsewhere: a purge that stopped at the cap would leave
// Rows behind with nothing left to find them by. Already-gone entities are the success case, so a retry is safe.
export const deleteTablePartitionEntities = async (
  tableClient: CustomTableClient<CompositeKey>,
  partitionKey: string,
) => {
  const filter = serializeClauses([
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: partitionKey },
  ]);
  for await (const page of tableClient
    .listEntities<CompositeKey>({ queryOptions: { filter } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    // A transaction is capped at 100 actions and may not span partitions — both hold here
    for (let i = 0; i < page.length; i += AZURE_MAX_BATCH_SIZE) {
      const batch = page.slice(i, i + AZURE_MAX_BATCH_SIZE);
      await tableClient.submitTransaction(
        batch.map(({ partitionKey, rowKey }) => ["delete", { partitionKey, rowKey }]),
      );
    }
};
