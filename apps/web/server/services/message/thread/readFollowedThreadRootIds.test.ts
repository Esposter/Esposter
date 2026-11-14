import type { MockDatabase } from "@esposter/db-mock";
import type { Database } from "@esposter/db-schema";

import { readFollowedThreadRootIds } from "#server/services/message/thread/readFollowedThreadRootIds";
import { createMockDb } from "@esposter/db-mock";
import { roomsInMessage, threadFollowsInMessage, usersInAuth } from "@esposter/db-schema";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

describe(readFollowedThreadRootIds, () => {
  const userId = "8f1c6a2e-4b7d-4e9a-8c31-2d5f7a9b0c11";
  const roomId = "3a9e0d4c-6b2f-4a7e-9d15-7c8b1e2f3a22";

  let db: Database;
  let mockDatabase: MockDatabase;

  beforeAll(async () => {
    mockDatabase = await createMockDb();
    db = mockDatabase.db;
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  afterEach(async () => {
    await mockDatabase.reset();
  });

  test("lists the followed roots newest first, by their integer ids, whatever order the follows were recorded in", async () => {
    expect.hasAssertions();

    await db.insert(usersInAuth).values({ email: "ann@example.com", emailVerified: false, id: userId, name: "Ann" });
    await db.insert(roomsInMessage).values({ id: roomId, name: "room", userId });
    await db.insert(threadFollowsInMessage).values([
      { roomId, threadRootId: 4, userId },
      { roomId, threadRootId: 12, userId },
      { roomId, threadRootId: 7, userId },
    ]);

    expect(await readFollowedThreadRootIds(db, roomId, userId)).toStrictEqual([12, 7, 4]);
  });
});
