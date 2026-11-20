import type { Database } from "@esposter/db-schema";

import { resolveNotification } from "#src/services/notification/resolveNotification";
import { createMockDb } from "@esposter/db-mock";
import { createUser } from "@esposter/db-mock/workers";
import { AppNotificationType, roomsInMessage, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { RoutePath, takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/getDb"), () => ({
  getDb() {
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
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });

    await expect(
      resolveNotification({ roomId: room.id, text, type: AppNotificationType.Reminder, userId }),
    ).resolves.toStrictEqual({ body: text, path: RoutePath.Messages(room.id), title: "Reminder", userIds: [userId] });
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

  // A departure removes the reminders the member set in the room from their object, and that removal can fail, leaving the reminder
  // Armed there. The membership is gone either way, so a reminder whose owner is no longer a member is dropped at its send
  test("resolves no notification for a reminder whose owner has left the room", async () => {
    expect.hasAssertions();

    const userId = v7();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
    await mockDb.delete(usersToRoomsInMessage).where(eq(usersToRoomsInMessage.userId, userId));

    await expect(
      resolveNotification({ roomId: room.id, text, type: AppNotificationType.Reminder, userId }),
    ).resolves.toBeUndefined();
  });
});
