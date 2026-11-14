import type { WebhookEventGridData } from "#src/models/message/WebhookEventGridData";
import type { WebhookPayload } from "@esposter/db-schema";

import { processWebhookHandler } from "#src/handlers/processWebhookHandler";
import { MOCK_EVENT_GRID_ENDPOINT } from "#src/services/azure/constants.test";
import { createEventGridEvent } from "#src/services/azure/createEventGridEvent.test";
import { InvocationContext } from "@azure/functions";
import { StreamTable } from "@esposter/db-schema";
import { MockEventGridDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

vi.mock(
  import("#src/services/azure/eventGridPublisherClient"),
  () => import("#src/services/azure/eventGridPublisherClient.test"),
);
vi.mock(
  import("#src/services/streams/getStreamTableClient"),
  () => import("#src/services/streams/getStreamTableClient.test"),
);
vi.mock(
  import("#src/services/server/publishToServer"),
  () => import("#src/services/server/publishToServer.test"),
);

describe(processWebhookHandler, () => {
  const context = new InvocationContext();
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  afterEach(() => {
    MockTableDatabase.clear();
    MockEventGridDatabase.clear();
  });

  test("creates message in table storage and publishes push notification event", async () => {
    expect.hasAssertions();

    const response = await processWebhookHandler(
      createEventGridEvent({
        data: {
          payload: { content: "content", username: "username" } satisfies WebhookPayload,
          webhook: { roomId, userId },
        } satisfies WebhookEventGridData,
      }),
      context,
    );

    expect(response).toBeUndefined();

    const messagesTable = MockTableDatabase.get(StreamTable.Messages);
    assert.exists(messagesTable);

    expect(messagesTable.size).toBe(1);

    const events = MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT);
    assert.exists(events);

    expect(events).toHaveLength(1);
  });
});
