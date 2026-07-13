import type { relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { sendReminderNotification } from "@/services/sendReminderNotification";
import { setupWebPushSuite } from "@/services/setupWebPushSuite.test";
import { webpush } from "@/services/webpush.test";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { pushSubscriptionsInMessage, roomsInMessage, users, usersToRoomsInMessage } from "@esposter/db-schema";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("@/services/webpush"), () => import("@/services/webpush.test"));

// The generic web-push send/expiry matrix lives in sendWebPushNotifications.test.ts; here only the wiring.
describe(sendReminderNotification, () => {
  const context = new InvocationContext();
  const name = "name";
  const roomId = randomUUID();
  const text = "text";
  const userId = randomUUID();
  const reminder = { roomId, text, userId };
  const { pushSubscription } = setupWebPushSuite(() => mockDb, userId);

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values({ email: "", emailVerified: true, id: userId, name });
    await mockDb.insert(roomsInMessage).values({ id: roomId, name, userId });
    await mockDb.insert(usersToRoomsInMessage).values({ roomId, userId });
  });

  test("completes without error when user has no push subscriptions", async () => {
    expect.hasAssertions();

    await expect(sendReminderNotification(context, reminder)).resolves.toBeUndefined();
  });

  test("sends notification to all subscriptions", async () => {
    expect.hasAssertions();

    await mockDb.insert(pushSubscriptionsInMessage).values(pushSubscription);

    await sendReminderNotification(context, reminder);

    expect(vi.mocked(webpush.sendNotification)).toHaveBeenCalledTimes(1);
  });
});
