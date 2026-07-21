import type { TableClient, TransactionAction } from "@azure/data-tables";

import { AZURE_MAX_BATCH_SIZE } from "@esposter/db-schema";

// A transaction is capped at 100 actions and may not span partitions, so a page of entities is split into
// Batches. Those batches hit disjoint rowKeys, so they submit concurrently; only the pagination that feeds
// Them is sequential. `onSubmit` runs per batch as soon as that batch commits, so a caller notifying per
// Batch still notifies after its own write — a run that stops partway keeps everything it committed
export const submitTransactionBatches = async <TEntity>(
  tableClient: Pick<TableClient, "submitTransaction">,
  entities: TEntity[],
  getAction: (entity: TEntity) => TransactionAction,
  onSubmit?: (batch: TEntity[]) => void,
): Promise<void> => {
  const batches: TEntity[][] = [];
  for (let i = 0; i < entities.length; i += AZURE_MAX_BATCH_SIZE)
    batches.push(entities.slice(i, i + AZURE_MAX_BATCH_SIZE));
  await Promise.all(
    batches.map(async (batch) => {
      await tableClient.submitTransaction(batch.map(getAction));
      onSubmit?.(batch);
    }),
  );
};
