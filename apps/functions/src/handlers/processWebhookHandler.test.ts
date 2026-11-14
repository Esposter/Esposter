import type { WebhookPayload, WebhookQueueMessage } from "@esposter/db-schema";

import { processWebhookHandler } from "#src/handlers/processWebhookHandler";
import { clearMockRooms, getRoomObject, openMockRooms } from "#src/services/room/getRoomObject.test";
import { MessageType } from "@esposter/db-schema";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("#src/services/room/getRoomObject"), () => import("#src/services/room/getRoomObject.test"));

describe(processWebhookHandler, () => {
  const content = "content";
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const username = "username";

  beforeAll(async () => {
    await openMockRooms();
  });

  // The message's creation time is the clock's, so it is frozen for the value to be asserted exactly
  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    clearMockRooms();
  });

  test("writes the message into the room as the webhook's app user, under the name the payload gives", async () => {
    expect.hasAssertions();

    await processWebhookHandler({
      payload: { content, username } satisfies WebhookPayload,
      webhook: { roomId, userId },
    } satisfies WebhookQueueMessage);

    expect(getRoomObject(roomId).readMessages({ limit: 10 })).toStrictEqual([
      {
        appUserId: userId,
        createdAt: new Date(0),
        files: [],
        id: 1,
        isEdited: false,
        isForward: false,
        isPinned: false,
        linkPreviewResponse: null,
        mentions: [],
        message: content,
        replyToId: null,
        senderName: username,
        type: MessageType.Webhook,
        updatedAt: new Date(0),
        userId: null,
      },
    ]);
  });
});
