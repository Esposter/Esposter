import { chunk } from "@/services/message/searchIndex/chunk";
import { SEARCH_INDEX_MAX_BATCH_SIZE } from "@/services/message/searchIndex/constants";
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
  // Omitting ROOM_IDS rebuilds every room that has messages.
  const roomIds = scopedRoomIds.length > 0 ? scopedRoomIds : await tableClient.listRoomIds();
  for (const roomId of roomIds) {
    const documents = await tableClient.listMessagesByRoom(roomId);
    const batches = chunk(documents, SEARCH_INDEX_MAX_BATCH_SIZE);
    console.log(`Rebuilding room ${roomId}: ${documents.length} documents across ${batches.length} batches`);
    for (const [index, batch] of batches.entries()) {
      await searchClient.mergeOrUploadDocuments(batch);
      console.log(`  Uploaded batch ${index + 1}/${batches.length} (${batch.length} documents)`);
    }
  }
}
