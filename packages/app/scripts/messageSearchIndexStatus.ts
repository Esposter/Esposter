import type { AzureTableEntityMap, Clause } from "@esposter/db-schema";

import { buildDriftReport } from "@@/scripts/searchIndex/buildDriftReport";
import { getMessageSearchClient } from "@@/scripts/searchIndex/getMessageSearchClient";
import { readScopedRoomIds } from "@@/scripts/searchIndex/readScopedRoomIds";
import { countEntities, getTableClient, serializeClauses, serializeSearchClauses } from "@esposter/db";
import { AzureTable, BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";
import { config } from "dotenv";

// Reports how far the `messages-index` search index has fallen behind the `Messages` table, room by room:
// The table row count minus the index document count. A non-zero drift is the signal to run the rebuild.
// Scope it to specific rooms with the `ROOM_IDS` env var (comma-separated) or omit it to cover every room.
config();
const messageClient = await getTableClient(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING, AzureTable.Messages);
const searchClient = getMessageSearchClient();
const roomIds = await readScopedRoomIds(messageClient);
const tableCounts = new Map<string, number>();
const indexCounts = new Map<string, number>();

for (const roomId of roomIds) {
  const clauses: Clause<AzureTableEntityMap[AzureTable.Messages]>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: roomId },
  ];
  tableCounts.set(roomId, await countEntities(messageClient, { filter: serializeClauses(clauses) }));
  const { count } = await searchClient.search("*", {
    filter: serializeSearchClauses(clauses),
    includeTotalCount: true,
    top: 0,
  });
  indexCounts.set(roomId, count ?? 0);
}

console.table(
  buildDriftReport(tableCounts, indexCounts).map(({ drift, indexCount, roomId, tableCount }) => ({
    drift,
    index: indexCount,
    roomId,
    table: tableCount,
  })),
);
