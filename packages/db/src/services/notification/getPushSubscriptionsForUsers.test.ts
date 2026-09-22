import type { Database } from "@esposter/db-schema";

import { createUser } from "#src/services/message/createUser.test";
import { getPushSubscriptionsForUsers } from "#src/services/notification/getPushSubscriptionsForUsers";
import { createMockDb } from "@esposter/db-mock";
import { pushSubscriptions, sessions, users } from "@esposter/db-schema";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(getPushSubscriptionsForUsers, () => {
  let db: Database;
  const name = "name";
  const userId = crypto.randomUUID();
  const otherUserId = crypto.randomUUID();
  const actingSessionId = crypto.randomUUID();
  const otherSessionId = crypto.randomUUID();

  beforeAll(async () => {
    db = await createMockDb();
    const createdAt = new Date(0);
    await db.insert(users).values([userId, otherUserId].map((id) => createUser(id, createdAt, name)));
    const expiresAt = new Date(createdAt.getTime() + Temporal.Duration.from({ days: 1 }).total("milliseconds"));
    await db.insert(sessions).values([
      { expiresAt, id: actingSessionId, token: actingSessionId, updatedAt: createdAt, userId },
      { expiresAt, id: otherSessionId, token: otherSessionId, updatedAt: createdAt, userId },
    ]);
    await db.insert(pushSubscriptions).values(
      [actingSessionId, otherSessionId].map((sessionId) => ({
        auth: "",
        endpoint: sessionId,
        p256dh: "",
        sessionId,
        userId,
      })),
    );
  });

  afterAll(async () => {
    await db.delete(users);
  });

  test("returns every subscription of the given users", async () => {
    expect.hasAssertions();

    const readPushSubscriptions = await getPushSubscriptionsForUsers(db, [userId, otherUserId]);

    expect(readPushSubscriptions.map(({ endpoint }) => endpoint).toSorted()).toStrictEqual(
      [actingSessionId, otherSessionId].toSorted(),
    );
  });

  test("excludes the session that caused the notification", async () => {
    expect.hasAssertions();

    const readPushSubscriptions = await getPushSubscriptionsForUsers(db, [userId], actingSessionId);

    expect(readPushSubscriptions.map(({ endpoint }) => endpoint)).toStrictEqual([otherSessionId]);
  });
});
