import { replayDeadLetterEvents } from "@/services/replayDeadLetterEvents";

const connectionString = process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING ?? "";
const topicEndpoint = process.env.AZURE_EVENT_GRID_TOPIC_ENDPOINT ?? "";
const topicKey = process.env.AZURE_EVENT_GRID_TOPIC_KEY ?? "";
if (!connectionString || !topicEndpoint || !topicKey) {
  console.error(
    "Missing required env: AZURE_STORAGE_ACCOUNT_CONNECTION_STRING, AZURE_EVENT_GRID_TOPIC_ENDPOINT, AZURE_EVENT_GRID_TOPIC_KEY",
  );
  process.exitCode = 1;
} else await replayDeadLetterEvents(connectionString, topicEndpoint, topicKey);
