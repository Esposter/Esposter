import type { Database } from "@esposter/db-schema";

import { getMessageNotificationAuthor } from "#src/services/notification/getMessageNotificationAuthor";
import { createUser } from "#src/services/shared/createUser.test";
import { createMockDb } from "@esposter/db-mock";
import { appUsersInMessage, roomsInMessage, usersInAuth, webhooksInMessage } from "@esposter/db-schema";
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

describe(getMessageNotificationAuthor, () => {
  const name = "name";
  const updatedName = "updatedName";

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
  });

  afterEach(async () => {
    await mockDb.delete(usersInAuth);
  });

  test("names a webhook's message as its webhook is named now, so a rename reaches the messages posted before it", async () => {
    expect.hasAssertions();

    const userId = v7();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    const appUser = takeOne(await mockDb.insert(appUsersInMessage).values({ id: v7() }).returning());
    await mockDb
      .insert(webhooksInMessage)
      .values({ creatorId: userId, id: v7(), name, roomId: room.id, tokenHash: v7(), userId: appUser.id });
    await mockDb.update(webhooksInMessage).set({ name: updatedName }).where(eq(webhooksInMessage.userId, appUser.id));

    await expect(getMessageNotificationAuthor({ appUserId: appUser.id, roomId: room.id })).resolves.toStrictEqual({
      icon: "",
      title: updatedName,
    });
  });
});
