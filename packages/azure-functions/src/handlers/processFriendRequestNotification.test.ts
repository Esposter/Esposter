import type { FriendRequestNotificationEventGridData, relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { processFriendRequestNotification } from "@/handlers/processFriendRequestNotification";
import { InvocationContext } from "@azure/functions";
import { createMockDb } from "@esposter/db-mock";
import { users } from "@esposter/db-schema";
import { beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: PostgresJsDatabase<typeof relations>;

vi.mock(import("@/services/db"), () => ({
  get db() {
    return mockDb;
  },
}));

vi.mock(import("@/services/webpush"), () => import("@/services/webpush.test"));

describe(processFriendRequestNotification, () => {
  const context = new InvocationContext();
  const name = "name";

  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  test("completes without error when user has no push subscriptions", async () => {
    expect.hasAssertions();

    const receiverId = crypto.randomUUID();
    await mockDb.insert(users).values({ email: "", emailVerified: true, id: receiverId, name });

    const result = await processFriendRequestNotification(
      {
        data: {
          notificationOptions: { icon: "", title: "" },
          receiverId,
        } satisfies FriendRequestNotificationEventGridData,
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
  });
});
