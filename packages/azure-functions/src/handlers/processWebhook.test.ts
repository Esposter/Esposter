import type { WebhookEventGridData } from "@/models/WebhookEventGridData";
import type { WebhookPayload } from "@esposter/db-schema";

import { processWebhook } from "@/handlers/processWebhook";
import { MOCK_EVENT_GRID_ENDPOINT } from "@/services/eventGridPublisherClient.test";
import { InvocationContext } from "@azure/functions";
import { AzureTable } from "@esposter/db-schema";
import { MockEventGridDatabase, MockTableDatabase } from "azure-mock";
import { afterEach, assert, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/eventGridPublisherClient"), () => import("@/services/eventGridPublisherClient.test"));
vi.mock(import("@/services/getTableClient"), () => import("@/services/getTableClient.test"));
vi.mock(import("@/services/getWebPubSubServiceClient"), () => import("@/services/getWebPubSubServiceClient.test"));

describe(processWebhook, () => {
  const context = new InvocationContext();
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  afterEach(() => {
    MockTableDatabase.clear();
    MockEventGridDatabase.clear();
  });

  test("creates message in table storage and publishes push notification event", async () => {
    expect.hasAssertions();

    const result = await processWebhook(
      {
        data: {
          payload: { content: "content", username: "username" } satisfies WebhookPayload,
          webhook: { roomId, userId },
        } satisfies WebhookEventGridData,
        dataVersion: "1.0",
        eventTime: "1970-01-01T00:00:00.000Z",
        eventType: "",
        id: crypto.randomUUID(),
        metadataVersion: "1",
        subject: "",
        topic: "",
      },
      context,
    );

    expect(result).toBeUndefined();

    const messagesTable = MockTableDatabase.get(AzureTable.Messages);
    assert.exists(messagesTable);

    expect(messagesTable.size).toBe(1);

    const events = MockEventGridDatabase.get(MOCK_EVENT_GRID_ENDPOINT);
    assert.exists(events);

    expect(events).toHaveLength(1);
  });
});
