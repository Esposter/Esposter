import type { EventGridEvent } from "@azure/functions";
import type { PushNotificationEventGridData, relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { processPushNotificationHandler } from "@/handlers/processPushNotificationHandler";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { users } from "@esposter/db-schema";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("@/services/webpush"), () => import("@/services/webpush.test"));

const createEvent = (data: EventGridEvent["data"]): EventGridEvent => ({
  data,
  dataVersion: "1.0",
  eventTime: "1970-01-01T00:00:00.000Z",
  eventType: "",
  id: crypto.randomUUID(),
  metadataVersion: "1",
  subject: "",
  topic: "",
});

describe(processPushNotificationHandler, () => {
  const context = new InvocationContext();
  const name = "name";
  const userId = crypto.randomUUID();
  const baseMessage = { message: "<p>hello</p>", partitionKey: crypto.randomUUID(), rowKey: crypto.randomUUID() };
  const notificationOptions = { icon: "", title: "" };

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values({ email: "", emailVerified: true, id: userId, name });
  });

  afterAll(async () => {
    await mockDb.delete(users);
  });

  test("completes without error when user has no push subscriptions", async () => {
    expect.hasAssertions();

    const result = await processPushNotificationHandler(
      createEvent({ message: { ...baseMessage, userId }, notificationOptions } satisfies PushNotificationEventGridData),
      context,
    );

    expect(result).toBeUndefined();
  });

  test("completes without error when message has no userId (webhook message)", async () => {
    expect.hasAssertions();

    // Webhook messages have no direct user author, so userId is absent from the payload
    const result = await processPushNotificationHandler(
      createEvent({ message: baseMessage, notificationOptions } satisfies PushNotificationEventGridData),
      context,
    );

    expect(result).toBeUndefined();
  });
});
