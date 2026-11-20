import type { MockDatabase } from "@esposter/db-mock";
import type { Database } from "@esposter/db-schema";

import { readThreadFollows } from "#server/services/message/thread/readThreadFollows";
import { getRowsPerStatement } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import { MAX_FOLLOWED_THREADS, roomsInMessage, threadFollowsInMessage, usersInAuth } from "@esposter/db-schema";
import { chunk } from "@esposter/shared";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(readThreadFollows, () => {
  const userId = "8f1c6a2e-4b7d-7e9a-8c31-2d5f7a9b0c11";
  const roomId = "3a9e0d4c-6b2f-7a7e-9d15-7c8b1e2f3a22";

  let db: Database;
  let mockDatabase: MockDatabase;

  beforeAll(async () => {
    mockDatabase = await createMockDb();
    db = mockDatabase.db;
  });

  beforeEach(async () => {
    await db.insert(usersInAuth).values({ email: "ann@example.com", emailVerified: false, id: userId, name: "Ann" });
    await db.insert(roomsInMessage).values({ id: roomId, name: "room", userId });
  });

  afterEach(async () => {
    await mockDatabase.reset();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  test("lists the followed roots newest first, by their integer ids, whatever order the follows were recorded in", async () => {
    expect.hasAssertions();

    await db.insert(threadFollowsInMessage).values([
      { roomId, threadRootId: 4, userId },
      { roomId, threadRootId: 12, userId },
      { roomId, threadRootId: 7, userId },
    ]);

    const follows = await readThreadFollows(db, roomId, userId);

    expect(follows.map(({ threadRootId }) => threadRootId)).toStrictEqual([12, 7, 4]);
  });

  test("returns every followed root past the drawer's cap, so an older thread keeps its follow state", async () => {
    expect.hasAssertions();

    const followCount = MAX_FOLLOWED_THREADS + 1;
    const follows = Array.from({ length: followCount }, (_value, index) => ({
      roomId,
      threadRootId: index + 1,
      userId,
    }));
    await Promise.all(
      chunk(follows, getRowsPerStatement(threadFollowsInMessage)).map((batch) =>
        db.insert(threadFollowsInMessage).values(batch),
      ),
    );

    const readFollows = await readThreadFollows(db, roomId, userId);

    expect(readFollows.map(({ threadRootId }) => threadRootId)).toStrictEqual(
      Array.from({ length: followCount }, (_value, index) => followCount - index),
    );
  });
});
