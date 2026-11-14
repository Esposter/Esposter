import type { WebhookPayload, WebhookQueueMessage } from "@esposter/db-schema";

import { processWebhookHandler } from "#src/handlers/processWebhookHandler";
import { clearRoomObjectCalls, roomObjectCalls } from "#src/services/room/getRoomObject.test";
import { v7 } from "uuid";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/room/getRoomObject"), () => import("#src/services/room/getRoomObject.test"));

describe(processWebhookHandler, () => {
  const content = "content";
  const deliveryId = v7();
  const roomId = v7();
  const userId = v7();
  const username = "username";
  // The one call a delivery sends the room: the webhook's app user, the name the payload gives, and the id it was accepted under
  const webhookMessageCall = {
    args: [{ appUserId: userId, deliveryId, message: content, senderName: username }],
    method: "createWebhookMessage",
    roomId,
  };

  afterEach(() => {
    clearRoomObjectCalls();
  });

  test("sends the message to the room as the webhook's app user, under the name the payload gives", async () => {
    expect.hasAssertions();

    await processWebhookHandler({
      deliveryId,
      payload: { content, username } satisfies WebhookPayload,
      webhook: { roomId, userId },
    } satisfies WebhookQueueMessage);

    expect(roomObjectCalls).toStrictEqual([webhookMessageCall]);
  });

  test("a redelivered push is sent to the room again under the delivery id it was accepted as", async () => {
    expect.hasAssertions();

    const delivery = {
      deliveryId,
      payload: { content, username } satisfies WebhookPayload,
      webhook: { roomId, userId },
    } satisfies WebhookQueueMessage;
    await processWebhookHandler(delivery);
    await processWebhookHandler(delivery);

    expect(roomObjectCalls).toStrictEqual([webhookMessageCall, webhookMessageCall]);
  });
});
