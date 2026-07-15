import type { AzureTable } from "@esposter/db-schema";

import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { serializeClauses } from "@esposter/db";
import { AZURE_MAX_PAGE_SIZE, BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";

// Azure Table has no "delete where partitionKey eq" — a partition is cleared by enumerating its keys.
// The scan is capped like every other read, so clearing a partition costs one page, not an unbounded walk
export const deleteTablePartition = async <TAzureTable extends AzureTable>(
  tableName: TAzureTable,
  partitionKey: string,
): Promise<void> => {
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
  // A delete needs no entity serialization, so the raw client method is the whole operation
  await Promise.all(rowKeys.map((rowKey) => tableClient.deleteEntity(partitionKey, rowKey)));
};
