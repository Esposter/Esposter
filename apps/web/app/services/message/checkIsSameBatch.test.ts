import { checkIsSameBatch } from "@/services/message/checkIsSameBatch";
import { SAME_BATCH_WINDOW_MS } from "@/services/message/constants";
import { MessageType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

const createdAt = new Date("2026-01-01T00:00:00Z");
const createMessage = (overrides: Partial<Parameters<typeof checkIsSameBatch>[0]> = {}) => ({
  appUser: { id: "app" },
  createdAt,
  type: MessageType.Text,
  userId: "author",
  ...overrides,
});

describe(checkIsSameBatch, () => {
  test("batches an author's consecutive messages within the window", () => {
    expect.hasAssertions();

    const nextMessage = createMessage({ createdAt: new Date(createdAt.getTime() - SAME_BATCH_WINDOW_MS) });

    expect(checkIsSameBatch(createMessage(), nextMessage)).toBe(true);
  });

  test("does not batch a message past the window", () => {
    expect.hasAssertions();

    const nextMessage = createMessage({ createdAt: new Date(createdAt.getTime() - SAME_BATCH_WINDOW_MS - 1) });

    expect(checkIsSameBatch(createMessage(), nextMessage)).toBe(false);
  });

  test("does not batch another author's message", () => {
    expect.hasAssertions();

    expect(checkIsSameBatch(createMessage(), createMessage({ userId: "someone-else" }))).toBe(false);
  });

  // A webhook has no user to match, so the posts of one app batch whatever user id each carries, and not across apps
  test("batches the webhook posts of one app and not those of two", () => {
    expect.hasAssertions();

    const webhook = { type: MessageType.Webhook };

    expect(checkIsSameBatch(createMessage(webhook), createMessage({ ...webhook, userId: "other" }))).toBe(true);
    expect(
      checkIsSameBatch(
        createMessage(webhook),
        createMessage({ ...webhook, appUser: { id: "other-app" }, userId: "other" }),
      ),
    ).toBe(false);
  });
});
