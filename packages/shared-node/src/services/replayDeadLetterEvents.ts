import { AzureKeyCredential, EventGridPublisherClient } from "@azure/eventgrid";
import { BlobServiceClient } from "@azure/storage-blob";
import { getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";

// Event Grid writes each exhausted delivery to the dead-letter container as a JSON array of the original
// Events in the Event Grid schema. Only these four fields are needed to re-publish; the delivery metadata
// (deadLetterReason, deliveryAttempts, ...) is intentionally dropped so the replayed event is a clean resend.
interface DeadLetteredEvent {
  data: unknown;
  dataVersion: string;
  eventType: string;
  subject: string;
}

const DEAD_LETTER_CONTAINER_NAME = "deadletter";
const ARCHIVE_PREFIX = "archived/";

const readRequiredEnvironmentVariable = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new InvalidOperationError(Operation.Read, name, "environment variable is not set");
  return value;
};

// Lists every blob the Event Grid dead-letter destination has written, re-publishes its events through the
// Existing key-authenticated publisher client, then archives the processed blob under `archived/` so a rerun
// Never double-sends it. Handlers are idempotent-or-tolerant, so a replayed event double-delivering is safe.
// The archived copy expires via the storage account's 30-day dead-letter lifecycle rule. Run manually against
// A resource group's storage + Event Grid credentials — never scheduled.
export const replayDeadLetterEvents = async (): Promise<void> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    readRequiredEnvironmentVariable("AZURE_STORAGE_ACCOUNT_CONNECTION_STRING"),
  );
  const eventGridPublisherClient = new EventGridPublisherClient(
    readRequiredEnvironmentVariable("AZURE_EVENT_GRID_TOPIC_ENDPOINT"),
    "EventGrid",
    new AzureKeyCredential(readRequiredEnvironmentVariable("AZURE_EVENT_GRID_TOPIC_KEY")),
  );
  const containerClient = blobServiceClient.getContainerClient(DEAD_LETTER_CONTAINER_NAME);

  for await (const blob of containerClient.listBlobsFlat()) {
    if (blob.name.startsWith(ARCHIVE_PREFIX)) continue;

    const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
    await getResultAsync(async () => {
      const buffer = await blockBlobClient.downloadToBuffer();
      const events: DeadLetteredEvent[] = JSON.parse(buffer.toString("utf8"));
      await eventGridPublisherClient.send(
        events.map((event) => ({
          data: event.data,
          dataVersion: event.dataVersion,
          eventType: event.eventType,
          subject: event.subject,
        })),
      );
      await containerClient.getBlockBlobClient(`${ARCHIVE_PREFIX}${blob.name}`).upload(buffer, buffer.length);
      await blockBlobClient.delete();
    }).match(noop, (error) => {
      console.error(`Failed to replay dead-letter blob ${blob.name}: `, error);
    });
  }
};
