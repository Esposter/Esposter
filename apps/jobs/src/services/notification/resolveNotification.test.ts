import type { Database } from "@esposter/db-schema";

import { resolveNotification } from "#src/services/notification/resolveNotification";
import { createUser } from "#src/services/shared/createUser.test";
import { createMockDb } from "@esposter/db-mock";
import { AppNotificationType, roomsInMessage, usersInAuth } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));

describe(resolveNotification, () => {
  const name = "name";
  const text = "text";

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
  });

  afterEach(async () => {
    await mockDb.delete(usersInAuth);
  });

  test("resolves a reminder of a room that still exists to the reminder's own text, linking to that room", async () => {
    expect.hasAssertions();

    const userId = v7();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());

    await expect(
      resolveNotification({ roomId: room.id, text, type: AppNotificationType.Reminder, userId }),
    ).resolves.toMatchObject({ body: text, userIds: [userId] });
  });

  // A reminder outlives the room it was set in when the room is deleted, and its deep link would lead nowhere
  test("resolves no notification for a reminder whose room was deleted", async () => {
    expect.hasAssertions();

    const userId = v7();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    await mockDb.delete(roomsInMessage).where(eq(roomsInMessage.id, room.id));

    await expect(
      resolveNotification({ roomId: room.id, text, type: AppNotificationType.Reminder, userId }),
    ).resolves.toBeUndefined();
  });
});
