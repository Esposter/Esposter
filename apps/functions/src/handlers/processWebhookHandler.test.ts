import type { WebhookPayload, WebhookQueueMessage } from "@esposter/db-schema";

import { processWebhookHandler } from "#src/handlers/processWebhookHandler";
import { MockJobQueueDatabase } from "#src/services/queue/getJobQueue.test";
import { getStreamTableClient } from "#src/services/streams/getStreamTableClient";
import { clearMockStreams, openMockStreams } from "#src/services/streams/getStreamTableClient.test";
import { QueueJob, StreamTable } from "@esposter/db-schema";
import { afterEach, assert, beforeAll, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/queue/getJobQueue"), () => import("#src/services/queue/getJobQueue.test"));
vi.mock(
  import("#src/services/streams/getStreamTableClient"),
  () => import("#src/services/streams/getStreamTableClient.test"),
);
vi.mock(import("#src/services/server/publishToServer"), () => import("#src/services/server/publishToServer.test"));

describe(processWebhookHandler, () => {
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  beforeAll(async () => {
    await openMockStreams();
  });

  afterEach(async () => {
    await clearMockStreams();
    MockJobQueueDatabase.clear();
  });

  test("creates message in the streams table and publishes push notification event", async () => {
    expect.hasAssertions();

    const response = await processWebhookHandler({
      payload: { content: "content", username: "username" } satisfies WebhookPayload,
      webhook: { roomId, userId },
    } satisfies WebhookQueueMessage);

    expect(response).toBeUndefined();

    const messages = await getStreamTableClient(StreamTable.Messages).list();
    expect(messages).toHaveLength(1);

    const events = MockJobQueueDatabase.get(QueueJob.ProcessNotification);
    assert.exists(events);

    expect(events).toHaveLength(1);
  });
});
