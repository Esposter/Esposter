import type { TableClient, TransactionAction } from "@azure/data-tables";

import { AZURE_MAX_BATCH_SIZE } from "@esposter/db-schema";

// A transaction is capped at 100 actions and may not span partitions, so a page of entities is split into
// Batches. Every batch of a page targets the same partition, so they submit sequentially to pace the writes
// Against that partition's throughput limit. `onSubmit` runs per batch as soon as that batch commits, so a
// Caller notifying per batch still notifies after its own write — a run that stops partway keeps everything
// It committed
export const submitTransactionBatches = async <TEntity>(
  tableClient: Pick<TableClient, "submitTransaction">,
  entities: TEntity[],
  getAction: (entity: TEntity) => TransactionAction,
  onSubmit?: (batch: TEntity[]) => void,
): Promise<void> => {
  for (let i = 0; i < entities.length; i += AZURE_MAX_BATCH_SIZE) {
    const batch = entities.slice(i, i + AZURE_MAX_BATCH_SIZE);
    await tableClient.submitTransaction(batch.map((entity) => getAction(entity)));
    onSubmit?.(batch);
  }
};
