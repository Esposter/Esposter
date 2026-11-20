import type { Database } from "@esposter/db-schema";

import { createUser } from "#src/services/shared/createUser.test";
import { purgeExpiredTombstones } from "#src/services/tombstone/purgeExpiredTombstones";
import { createMockDb } from "@esposter/db-mock";
import {
  AppNotificationType,
  notificationsInNotification,
  NotificationSeverity,
  usersInAuth,
} from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/getDb"), () => ({
  getDb() {
    return mockDb;
  },
}));

describe(purgeExpiredTombstones, () => {
  const userId = v7();
  const title = "title";
  // The clock the purge reads, 30 days after the epoch: a deletion at the epoch is past the seven-day retention, and one
  // 24 days after the epoch is inside it
  const clockNow = new Date(Temporal.Duration.from({ days: 30 }).total("milliseconds"));
  const expiredDeletedAt = new Date(0);
  const withinRetentionDeletedAt = new Date(Temporal.Duration.from({ days: 24 }).total("milliseconds"));

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await mockDb.insert(usersInAuth).values(createUser(userId));
  });

  afterEach(async () => {
    vi.useRealTimers();
    await mockDb.delete(notificationsInNotification);
  });

  // A notification stands in for every overlay table: each is a row a soft delete tombstones, and its purge is the same
  // statement. The row is created at the epoch, so its age is never the reason it is kept or removed
  const insertNotification = async (deletedAt: Date | null) => {
    const id = v7();
    await mockDb
      .insert(notificationsInNotification)
      .values({
        createdAt: new Date(0),
        deletedAt,
        id,
        severity: NotificationSeverity.Info,
        title,
        type: AppNotificationType.ResourceOperation,
        userId,
      });
    return id;
  };

  test("purges a tombstone whose deletion is past the retention", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: clockNow, toFake: ["Date"] });
    await insertNotification(expiredDeletedAt);
    await purgeExpiredTombstones();

    await expect(mockDb.select().from(notificationsInNotification)).resolves.toStrictEqual([]);
  });

  test("keeps a tombstone whose deletion is inside the retention", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: clockNow, toFake: ["Date"] });
    const withinRetentionId = await insertNotification(withinRetentionDeletedAt);
    await purgeExpiredTombstones();

    const rows = await mockDb.select().from(notificationsInNotification);
    expect(rows.map(({ id }) => id)).toStrictEqual([withinRetentionId]);
  });

  test("never touches a live row, however old it is", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: clockNow, toFake: ["Date"] });
    const liveId = await insertNotification(null);
    await purgeExpiredTombstones();

    const rows = await mockDb.select().from(notificationsInNotification);
    expect(rows.map(({ id }) => id)).toStrictEqual([liveId]);
  });
});
