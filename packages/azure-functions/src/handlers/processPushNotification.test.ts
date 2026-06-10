import type { PushNotificationEventGridData, relations } from "@esposter/db-schema";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { processPushNotification } from "@/handlers/processPushNotification";
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

describe(processPushNotification, () => {
  const context = new InvocationContext({ logHandler: () => {} });

  beforeAll(async () => {
    mockDb = await createMockDb();
  });

  test("completes without error when user has no push subscriptions", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    await mockDb.insert(users).values({ email: "", emailVerified: true, id: userId, name: "" });

    const result = await processPushNotification(
      {
        data: {
          message: { message: "<p>hello</p>", partitionKey: crypto.randomUUID(), rowKey: "rowKey", userId },
          notificationOptions: { icon: "", title: "" },
        } satisfies PushNotificationEventGridData as Record<string, unknown>,
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
