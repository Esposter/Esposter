import type { CustomTableClient, ResourceActivityEntity } from "@esposter/db-schema";

import { serializeClauses } from "@/services/azure/transformer/serializeClauses";
import {
  AZURE_MAX_BATCH_SIZE,
  AZURE_MAX_PAGE_SIZE,
  BinaryOperator,
  CompositeKeyPropertyNames,
} from "@esposter/db-schema";

// Azure Table has no partition-drop, so clearing a resource's history means enumerating its
// Partition and batch-deleting. Already-gone entities are the success case, so a retry is safe.
export const deleteResourceActivities = async (
  resourceActivityClient: CustomTableClient<ResourceActivityEntity>,
  resourceId: string,
) => {
  const filter = serializeClauses([
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: resourceId },
  ]);
  for await (const page of resourceActivityClient
    .listEntities<ResourceActivityEntity>({ queryOptions: { filter } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    // A transaction is capped at 100 actions and may not span partitions — both hold here
    for (let i = 0; i < page.length; i += AZURE_MAX_BATCH_SIZE) {
      const batch = page.slice(i, i + AZURE_MAX_BATCH_SIZE);
      await resourceActivityClient.submitTransaction(
        batch.map(({ partitionKey, rowKey }) => ["delete", { partitionKey, rowKey }]),
      );
    }
};
