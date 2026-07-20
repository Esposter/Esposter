import { deadLetteredEventsSchema } from "@/models/DeadLetteredEvent";
import { AzureKeyCredential, EventGridPublisherClient } from "@azure/eventgrid";
import { BlobServiceClient } from "@azure/storage-blob";
import { getResultAsync, noop } from "@esposter/shared";

const DEAD_LETTER_CONTAINER_NAME = "deadletter";
const ARCHIVE_PREFIX = "archived/";

// Lists every blob the Event Grid dead-letter destination has written, re-publishes its events through the
// Existing key-authenticated publisher client, then archives the processed blob under `archived/` so a rerun
// Never double-sends it. Handlers are idempotent-or-tolerant, so a replayed event double-delivering is safe.
// The archived copy expires via the storage account's 30-day dead-letter lifecycle rule. Run manually against
// A resource group's storage + Event Grid credentials — never scheduled.
export const replayDeadLetterEvents = async (
  connectionString: string,
  topicEndpoint: string,
  topicKey: string,
): Promise<void> => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const eventGridPublisherClient = new EventGridPublisherClient(
    topicEndpoint,
    "EventGrid",
    new AzureKeyCredential(topicKey),
  );
  const containerClient = blobServiceClient.getContainerClient(DEAD_LETTER_CONTAINER_NAME);

  for await (const blob of containerClient.listBlobsFlat()) {
    if (blob.name.startsWith(ARCHIVE_PREFIX)) continue;

    const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
    await getResultAsync(async () => {
      const buffer = await blockBlobClient.downloadToBuffer();
      const events = deadLetteredEventsSchema.parse(JSON.parse(buffer.toString("utf8")));
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
      console.error(`Failed to replay dead-letter blob ${blob.name}:`, error);
    });
  }
};
