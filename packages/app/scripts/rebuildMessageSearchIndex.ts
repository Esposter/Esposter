import type { AzureTableEntityMap, Clause } from "@esposter/db-schema";

import { getMessageSearchClient } from "@@/scripts/searchIndex/getMessageSearchClient";
import { readScopedRoomIds } from "@@/scripts/searchIndex/readScopedRoomIds";
import { serializeMessageSearchDocument } from "@@/scripts/searchIndex/serializeMessageSearchDocument";
import { getTableClient, getTopNEntitiesByType, serializeClauses } from "@esposter/db";
import {
  AZURE_MAX_PAGE_SIZE,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  MessageEntityMap,
} from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { config } from "dotenv";

// Re-feeds a room's (or every room's) messages from the `Messages` table back into the `messages-index` search
// Index, keyed by document id (`RowKey`), so re-running it is an idempotent upsert. Scope it to specific rooms
// With the `ROOM_IDS` env var (comma-separated) or omit it to cover every room.
config();
const messageClient = await getTableClient(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING, AzureTable.Messages);
const searchClient = getMessageSearchClient();
const roomIds = await readScopedRoomIds(messageClient);

for (const roomId of roomIds) {
  const clauses: Clause<AzureTableEntityMap[AzureTable.Messages]>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
  ];
  // A rebuild reads a room whole, so it pages until the partition is exhausted rather than to a limit.
  const messages = await getTopNEntitiesByType(messageClient, Number.POSITIVE_INFINITY, MessageEntityMap, {
    filter: serializeClauses(clauses),
  });
  const documents = messages.map((message) => serializeMessageSearchDocument(message));
  const batchCount = Math.ceil(documents.length / AZURE_MAX_PAGE_SIZE);
  console.log(`Rebuilding room ${roomId}: ${documents.length} documents across ${batchCount} batches`);
  // One failing room leaves the rest of the rebuild worth finishing, so it is reported and skipped.
  await getResultAsync(async () => {
    for (let index = 0; index < documents.length; index += AZURE_MAX_PAGE_SIZE) {
      const batch = documents.slice(index, index + AZURE_MAX_PAGE_SIZE);
      await searchClient.mergeOrUploadDocuments(batch);
      console.log(`  Uploaded batch ${index / AZURE_MAX_PAGE_SIZE + 1}/${batchCount} (${batch.length} documents)`);
    }
  }).match(noop, (error) => {
    console.error(`Failed to rebuild room ${roomId}:`, error);
  });
}
