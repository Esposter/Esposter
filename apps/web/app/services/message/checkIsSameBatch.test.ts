import { checkIsSameBatch } from "@/services/message/checkIsSameBatch";
import { SAME_BATCH_WINDOW_MS } from "@/services/message/constants";
import { createMessageEntity, MessageType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(checkIsSameBatch, () => {
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();
  const createdAt = new Date(0);
  const createStandardMessage = (messageUserId: string, messageCreatedAt: Date) =>
    Object.assign(createMessageEntity({ roomId, type: MessageType.Message, userId: messageUserId }), {
      createdAt: messageCreatedAt,
    });
  const createWebhookMessage = (appId: string, messageCreatedAt: Date) =>
    Object.assign(createMessageEntity({ appUser: { id: appId }, roomId, type: MessageType.Webhook }), {
      createdAt: messageCreatedAt,
    });

  test("batches an author's consecutive messages within the window", () => {
    expect.hasAssertions();

    const nextMessage = createStandardMessage(userId, new Date(createdAt.getTime() - SAME_BATCH_WINDOW_MS));

    expect(checkIsSameBatch(createStandardMessage(userId, createdAt), nextMessage)).toBe(true);
  });

  test("does not batch a message past the window", () => {
    expect.hasAssertions();

    const nextMessage = createStandardMessage(userId, new Date(createdAt.getTime() - SAME_BATCH_WINDOW_MS - 1));

    expect(checkIsSameBatch(createStandardMessage(userId, createdAt), nextMessage)).toBe(false);
  });

  test("does not batch another author's message", () => {
    expect.hasAssertions();

    expect(
      checkIsSameBatch(createStandardMessage(userId, createdAt), createStandardMessage(crypto.randomUUID(), createdAt)),
    ).toBe(false);
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
