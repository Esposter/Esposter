import type { AzureTable } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { serializeClauses } from "@esposter/db";
import {
  AZURE_MAX_BATCH_SIZE,
  AZURE_MAX_PAGE_SIZE,
  BinaryOperator,
  CompositeKeyPropertyNames,
} from "@esposter/db-schema";

// Azure Table has no "delete where partitionKey eq" — a partition is cleared by enumerating its keys.
// The scan is capped like every other read, so clearing a partition costs one page, not an unbounded walk
export const deleteTablePartition = async (tableName: AzureTable, partitionKey: string): Promise<void> => {
  const tableClient = await useTableClient(tableName);
  const filter = serializeClauses([
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: partitionKey },
  ]);
  const rowKeys: string[] = [];
  // One page like every other capped read — never a bare listEntities walk
  for await (const page of tableClient
    .listEntities<{ rowKey: string }>({ queryOptions: { filter, select: [CompositeKeyPropertyNames.rowKey] } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE })) {
    for (const { rowKey } of page) rowKeys.push(rowKey);
    break;
  }
  // Every row here is by definition the one partition this clears, so the deletes ride a transaction per
  // Batch rather than a request each — the capped page turns into ten calls instead of a thousand, on a
  // Mutation the owner is waiting on. A delete needs no entity serialization: the composite key is the action
  for (let i = 0; i < rowKeys.length; i += AZURE_MAX_BATCH_SIZE)
    await tableClient.submitTransaction(
      rowKeys.slice(i, i + AZURE_MAX_BATCH_SIZE).map((rowKey) => ["delete", { partitionKey, rowKey }]),
    );
};
