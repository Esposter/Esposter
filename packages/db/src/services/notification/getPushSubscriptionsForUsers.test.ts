import type { Database } from "@esposter/db-schema";

import { dayjs } from "#src/services/dayjs/index";
import { createUser } from "#src/services/message/createUser.test";
import { getPushSubscriptionsForUsers } from "#src/services/notification/getPushSubscriptionsForUsers";
import { createMockDb } from "@esposter/db-mock";
import { pushSubscriptions, sessions, users } from "@esposter/db-schema";
import { ID_SEPARATOR } from "@esposter/shared";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

const getEndpoint = (sessionId: string) => `https://push.example.com/${sessionId}`;

describe(getPushSubscriptionsForUsers, () => {
  let db: Database;
  const name = "name";
  const userId = crypto.randomUUID();
  const otherUserId = crypto.randomUUID();
  const actingSessionId = `session${ID_SEPARATOR}acting`;
  const otherSessionId = `session${ID_SEPARATOR}other`;

  beforeAll(async () => {
    db = await createMockDb();
    const createdAt = new Date();
    await db.insert(users).values([userId, otherUserId].map((id) => createUser(id, createdAt, name)));
    const expiresAt = dayjs(createdAt).add(1, "day").toDate();
    await db.insert(sessions).values([
      { expiresAt, id: actingSessionId, token: actingSessionId, updatedAt: createdAt, userId },
      { expiresAt, id: otherSessionId, token: otherSessionId, updatedAt: createdAt, userId },
    ]);
    await db.insert(pushSubscriptions).values(
      [actingSessionId, otherSessionId].map((sessionId) => ({
        auth: "",
        endpoint: getEndpoint(sessionId),
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
      [getEndpoint(actingSessionId), getEndpoint(otherSessionId)].toSorted(),
    );
  });

  test("excludes the session that caused the notification", async () => {
    expect.hasAssertions();

    const readPushSubscriptions = await getPushSubscriptionsForUsers(db, [userId], actingSessionId);

    expect(readPushSubscriptions.map(({ endpoint }) => endpoint)).toStrictEqual([getEndpoint(otherSessionId)]);
  });
});
