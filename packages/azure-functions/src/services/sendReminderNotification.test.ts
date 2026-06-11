import type { relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { sendReminderNotification } from "@/services/sendReminderNotification";
import { webpush } from "@/services/webpush.test";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { pushSubscriptionsInMessage, roomsInMessage, users, usersToRoomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { WebPushError } from "web-push";

let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("@/services/webpush"), () => import("@/services/webpush.test"));

describe(sendReminderNotification, () => {
  const context = new InvocationContext();
  const endpoint = "http://mock-endpoint";
  const name = "name";
  const roomId = crypto.randomUUID();
  const userId = crypto.randomUUID();

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values({ email: "", emailVerified: true, id: userId, name });
    await mockDb.insert(roomsInMessage).values({ id: roomId, name, userId });
    await mockDb.insert(usersToRoomsInMessage).values({ roomId, userId });
  });

  afterEach(async () => {
    await mockDb.delete(pushSubscriptionsInMessage).where(eq(pushSubscriptionsInMessage.userId, userId));
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await mockDb.delete(users);
  });

  test("completes without error when user has no push subscriptions", async () => {
    expect.hasAssertions();

    await expect(sendReminderNotification(context, { roomId, text: "reminder", userId })).resolves.toBeUndefined();
  });

  test("sends notification to all subscriptions", async () => {
    expect.hasAssertions();

    await mockDb.insert(pushSubscriptionsInMessage).values({ auth: "", endpoint, p256dh: "", userId });

    await sendReminderNotification(context, { roomId, text: "reminder", userId });

    expect(vi.mocked(webpush.sendNotification)).toHaveBeenCalledTimes(1);
  });

  test("deletes expired subscription when status code is 410", async () => {
    expect.hasAssertions();

    const pushSubscription = takeOne(
      await mockDb.insert(pushSubscriptionsInMessage).values({ auth: "", endpoint, p256dh: "", userId }).returning(),
      0,
    );

    vi.mocked(webpush.sendNotification).mockRejectedValueOnce(
      new WebPushError("Gone", 410, {} as Record<string, string>, "", ""),
    );

    await sendReminderNotification(context, { roomId, text: "reminder", userId });

    const remainingPushSubscriptions = await mockDb
      .select()
      .from(pushSubscriptionsInMessage)
      .where(eq(pushSubscriptionsInMessage.id, pushSubscription.id));

    expect(remainingPushSubscriptions).toHaveLength(0);
  });
});
