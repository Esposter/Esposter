import { buildDriftReport } from "@/services/message/searchIndex/buildDriftReport";
import { parseStorageConnectionString } from "@/services/message/searchIndex/parseStorageConnectionString";
import { createSearchIndexRestClient } from "@/services/message/searchIndex/searchIndexRestClient";
import { createTableRestClient } from "@/services/message/searchIndex/tableRestClient";

const connectionString = process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING ?? "";
const searchBaseUrl = process.env.AZURE_SEARCH_BASE_URL ?? "";
const searchApiKey = process.env.AZURE_SEARCH_API_KEY ?? "";
if (!connectionString || !searchBaseUrl || !searchApiKey) {
  console.error(
    "Missing required env: AZURE_STORAGE_ACCOUNT_CONNECTION_STRING, AZURE_SEARCH_BASE_URL, AZURE_SEARCH_API_KEY",
  );
  process.exitCode = 1;
} else {
  const tableClient = createTableRestClient(parseStorageConnectionString(connectionString));
  const searchClient = createSearchIndexRestClient(searchBaseUrl, searchApiKey);
  const scopedRoomIds = (process.env.ROOM_IDS ?? "")
    .split(",")
    .map((roomId) => roomId.trim())
    .filter(Boolean);
  // Omitting ROOM_IDS scans every room that has messages.
  const roomIds = scopedRoomIds.length > 0 ? scopedRoomIds : await tableClient.listRoomIds();
  const tableCounts = new Map<string, number>();
  const indexCounts = new Map<string, number>();
  for (const roomId of roomIds) {
    tableCounts.set(roomId, (await tableClient.listMessageRowKeysByRoom(roomId)).length);
    indexCounts.set(roomId, await searchClient.countDocumentsByRoom(roomId));
  }
  console.table(
    buildDriftReport(tableCounts, indexCounts).map(({ drift, indexCount, roomId, tableCount }) => ({
      drift,
      index: indexCount,
      roomId,
      table: tableCount,
    })),
  );
}
