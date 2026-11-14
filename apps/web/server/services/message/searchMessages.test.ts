import type { Database } from "@esposter/db-schema";
import type { MockDatabase } from "@esposter/db-mock";

import { searchMessages } from "#server/services/message/searchMessages";
import { CREATED_AT_DESCENDING_SORT_ITEM } from "#shared/services/pagination/constants";
import { createMockDb } from "@esposter/db-mock";
import { MessageType, messagesInMessage, roomsInMessage, usersInAuth } from "@esposter/db-schema";
import { MAX_READ_LIMIT } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

// The index is kept by the triggers on the messages table, so these rows are written straight through Drizzle, and a
// search that finds them proves the trigger wrote the index in the same statement as the row
describe(searchMessages, () => {
  const userId = "8f1c6a2e-4b7d-4e9a-8c31-2d5f7a9b0c11";
  const roomId = "3a9e0d4c-6b2f-4a7e-9d15-7c8b1e2f3a22";
  const otherRoomId = "c4d7b2a1-9e3f-4f60-8a2b-5e6d7c8b9a33";
  const messageId = "1b2c3d4e-5f60-4718-9a0b-c1d2e3f4a501";
  const otherMessageId = "2c3d4e5f-6071-4829-8b1c-d2e3f4a5b612";
  const roomMessageId = "3d4e5f60-7182-4930-9c2d-e3f4a5b6c723";
  const search = (query: string) =>
    searchMessages(db, {
      filters: [],
      limit: MAX_READ_LIMIT,
      offset: 0,
      query,
      roomId,
      sortBy: [CREATED_AT_DESCENDING_SORT_ITEM],
    }).then(({ data: { items } }) => items.map(({ id }) => id));

  let db: Database;
  let mockDatabase: MockDatabase;

  const insertMessage = async (id: string, message: string, messageRoomId = roomId) => {
    await db
      .insert(messagesInMessage)
      .values({ id, message, roomId: messageRoomId, type: MessageType.Message, userId });
  };

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

  const insertRooms = async () => {
    await db.insert(usersInAuth).values({ email: "ann@example.com", emailVerified: false, id: userId, name: "Ann" });
    await db.insert(roomsInMessage).values([
      { id: roomId, name: "room", userId },
      { id: otherRoomId, name: "other", userId },
    ]);
  };

  test("finds a message by its words, and by the prefix of the last word", async () => {
    expect.hasAssertions();

    await insertRooms();
    await insertMessage(messageId, "the gate is open");

    expect(await search("gate")).toStrictEqual([messageId]);
    expect(await search("ope")).toStrictEqual([messageId]);
  });

  test("an edit changes what matches, since the index follows the row", async () => {
    expect.hasAssertions();

    await insertRooms();
    await insertMessage(messageId, "the gate is open");
    await db.update(messagesInMessage).set({ message: "the door is shut" }).where(eq(messagesInMessage.id, messageId));

    expect(await search("gate")).toStrictEqual([]);
    expect(await search("door")).toStrictEqual([messageId]);
  });

  test("a soft-deleted message stops matching", async () => {
    expect.hasAssertions();

    await insertRooms();
    await insertMessage(messageId, "the gate is open");
    await db
      .update(messagesInMessage)
      .set({ deletedAt: new Date() })
      .where(eq(messagesInMessage.id, messageId));

    expect(await search("gate")).toStrictEqual([]);
  });

  test("a message in another room never matches", async () => {
    expect.hasAssertions();

    await insertRooms();
    await insertMessage(messageId, "the gate is open");
    await insertMessage(otherMessageId, "the gate is shut", otherRoomId);
    await insertMessage(roomMessageId, "a gate in this room", roomId);

    expect((await search("gate")).toSorted()).toStrictEqual([messageId, roomMessageId].toSorted());
  });

  // Each query is a search operator typed as text: a boolean word, a wildcard, a column filter, a quote that would close
  // its term early. A word typed as one is found as one, and an operator is never a match-all, so none of these reads
  // the room's whole history
  test("reads user text as literal words, never as FTS5 syntax", async () => {
    expect.hasAssertions();

    await insertRooms();
    await insertMessage(messageId, "logic OR gate, the NEAR field");
    await insertMessage(otherMessageId, "a plain line");

    expect(await search("OR")).toStrictEqual([messageId]);
    expect(await search("NEAR")).toStrictEqual([messageId]);
    expect(await search("*")).toStrictEqual([]);
    expect(await search(`"`)).toStrictEqual([]);
    expect(await search(`a"OR"b`)).toStrictEqual([]);
    expect(await search("message:secret")).toStrictEqual([]);
  });
});
