import type { Database } from "@esposter/db-schema";

import { sendReminderNotification } from "#src/services/sendReminderNotification";
import { setupWebPushSuite } from "#src/services/setupWebPushSuite.test";
import { webpush } from "#src/services/webpush.test";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { pushSubscriptionsInMessage, roomsInMessage, users, usersToRoomsInMessage } from "@esposter/db-schema";
import { beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("#src/services/webpush"), () => import("#src/services/webpush.test"));

// The generic web-push send/expiry matrix lives in sendWebPushNotifications.test.ts; here only the wiring.
describe(sendReminderNotification, () => {
  const context = new InvocationContext();
  const name = "name";
  const roomId = crypto.randomUUID();
  const text = "text";
  const userId = crypto.randomUUID();
  const reminder = { roomId, text, userId };
  const { pushSubscription, seedSession } = setupWebPushSuite(() => mockDb, userId);

  beforeAll(async () => {
    mockDb = await createMockDb();
    await mockDb.insert(users).values({ email: "", emailVerified: true, id: userId, name });
    await seedSession();
    await mockDb.insert(roomsInMessage).values({ id: roomId, name, userId });
    await mockDb.insert(usersToRoomsInMessage).values({ roomId, userId });
  });

  test("sends notification to all subscriptions", async () => {
    expect.hasAssertions();

    await mockDb.insert(pushSubscriptionsInMessage).values(pushSubscription);

    await sendReminderNotification(context, reminder);

    expect(vi.mocked(webpush.sendNotification)).toHaveBeenCalledTimes(1);
  });
});
