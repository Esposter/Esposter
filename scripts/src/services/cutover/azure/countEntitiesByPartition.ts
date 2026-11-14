import type { TableClient } from "@azure/data-tables";

import { listTableEntities } from "#src/services/cutover/azure/listTableEntities";

// The entity count of every partition, read from the keys alone: Azure Table has no count, so every key is walked once.
// The verify compares these counts with the typed rows' partitions
export const countEntitiesByPartition = async (tableClient: TableClient): Promise<Map<string, number>> => {
  const counts = new Map<string, number>();
  for await (const entity of listTableEntities(tableClient, { select: ["PartitionKey"] })) {
    const partitionKey = String(entity.partitionKey);
    counts.set(partitionKey, (counts.get(partitionKey) ?? 0) + 1);
  }
  return counts;
};
