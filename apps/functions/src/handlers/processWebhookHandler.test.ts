import type { WebhookPayload, WebhookQueueMessage } from "@esposter/db-schema";

import { processWebhookHandler } from "#src/handlers/processWebhookHandler";
import { MockJobQueueDatabase } from "#src/services/queue/getJobQueue.test";
import { QueueJob, StreamTable } from "@esposter/db-schema";
import { MockTableDatabase } from "azure-mock";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/queue/getJobQueue"), () => import("#src/services/queue/getJobQueue.test"));
vi.mock(
  import("#src/services/streams/getStreamTableClient"),
  () => import("#src/services/streams/getStreamTableClient.test"),
);
vi.mock(
  import("#src/services/server/publishToServer"),
  () => import("#src/services/server/publishToServer.test"),
);

describe(processWebhookHandler, () => {
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  afterEach(() => {
    MockTableDatabase.clear();
    MockJobQueueDatabase.clear();
  });

  test("creates message in table storage and publishes push notification event", async () => {
    expect.hasAssertions();

    const response = await processWebhookHandler({
      payload: { content: "content", username: "username" } satisfies WebhookPayload,
      webhook: { roomId, userId },
    } satisfies WebhookQueueMessage);

    expect(response).toBeUndefined();

    const messagesTable = MockTableDatabase.get(StreamTable.Messages);
    assert.exists(messagesTable);

    expect(messagesTable.size).toBe(1);

    const events = MockJobQueueDatabase.get(QueueJob.ProcessNotification);
    assert.exists(events);

    expect(events).toHaveLength(1);
  });
});
