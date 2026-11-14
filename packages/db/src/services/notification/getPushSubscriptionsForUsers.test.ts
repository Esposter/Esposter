import type { Database } from "@esposter/db-schema";

import { createUser } from "#src/services/message/createUser.test";
import { getPushSubscriptionsForUsers } from "#src/services/notification/getPushSubscriptionsForUsers";
import { createMockDb } from "@esposter/db-mock";
import { pushSubscriptionsInNotification, sessionsInAuth, usersInAuth } from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(getPushSubscriptionsForUsers, () => {
  let db: Database;
  const name = "name";
  const userId = v7();
  const otherUserId = v7();
  const actingSessionId = v7();
  const otherSessionId = v7();

  beforeAll(async () => {
    db = (await createMockDb()).db;
    const createdAt = new Date(0);
    await db.insert(usersInAuth).values([userId, otherUserId].map((id) => createUser(id, createdAt, name)));
    const expiresAt = new Date(createdAt.getTime() + Temporal.Duration.from({ days: 1 }).total("milliseconds"));
    await db.insert(sessionsInAuth).values([
      { expiresAt, id: actingSessionId, token: actingSessionId, updatedAt: createdAt, userId },
      { expiresAt, id: otherSessionId, token: otherSessionId, updatedAt: createdAt, userId },
    ]);
    await db
      .insert(pushSubscriptionsInNotification)
      .values(
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
    await db.delete(usersInAuth);
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

  // One user past Postgres's cap of 65,535 bind parameters, so a single statement for this room is refused. The owner
  // Is the last user, so the read only finds its subscriptions if it reaches the final wave
  test("reads the subscriptions of a room too large for one statement", async () => {
    expect.hasAssertions();

    const roomUserIds = [...Array.from({ length: 65_535 }, () => v7()), userId];
    const readPushSubscriptions = await getPushSubscriptionsForUsers(db, roomUserIds);

    expect(readPushSubscriptions.map(({ endpoint }) => endpoint).toSorted()).toStrictEqual(
      [actingSessionId, otherSessionId].toSorted(),
    );
  });
});
