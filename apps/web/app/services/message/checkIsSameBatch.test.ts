import { checkIsSameBatch } from "#src/services/message/checkIsSameBatch";
import { SAME_BATCH_WINDOW_MS } from "#src/services/message/constants";
import { createMessage } from "#src/services/message/message/createMessage.test";
import { MessageType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(checkIsSameBatch, () => {
  const roomId = v7();
  const userId = v7();
  const createdAt = new Date(0);
  const createStandardMessage = (messageUserId: string, messageCreatedAt: Date) => ({
    ...createMessage(roomId),
    createdAt: messageCreatedAt,
    userId: messageUserId,
  });
  const createWebhookMessage = (appId: string, messageCreatedAt: Date) => ({
    ...createMessage(roomId, "", MessageType.Webhook),
    appUserId: appId,
    createdAt: messageCreatedAt,
    userId: null,
  });

  test.each([
    {
      expected: true,
      gapMs: SAME_BATCH_WINDOW_MS,
      title: "batches an author's consecutive messages within the window",
    },
    {
      expected: false,
      gapMs: SAME_BATCH_WINDOW_MS + 1,
      title: "does not batch an author's consecutive messages past the window",
    },
  ])("$title", ({ expected, gapMs }) => {
    expect.hasAssertions();

    const nextMessage = createStandardMessage(userId, new Date(createdAt.getTime() - gapMs));

    expect(checkIsSameBatch(createStandardMessage(userId, createdAt), nextMessage)).toBe(expected);
  });

  test("does not batch another author's message", () => {
    expect.hasAssertions();

    expect(checkIsSameBatch(createStandardMessage(userId, createdAt), createStandardMessage(v7(), createdAt))).toBe(
      false,
    );
  });

  // A webhook has no user id, so the posts of one app batch with each other and not with those of another app
  test("batches the webhook posts of one app and not those of two", () => {
    expect.hasAssertions();

    expect(checkIsSameBatch(createWebhookMessage("app", createdAt), createWebhookMessage("app", createdAt))).toBe(true);
    expect(checkIsSameBatch(createWebhookMessage("app", createdAt), createWebhookMessage("other-app", createdAt))).toBe(
      false,
    );
  });
});
