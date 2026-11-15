import type { MockDatabase } from "@esposter/db-mock";
import type { Database } from "@esposter/db-schema";

import { createMention } from "#src/services/message/createMention.test";
import { createUser } from "#src/services/message/createUser.test";
import { decrementMentionCounts } from "#src/services/message/decrementMentionCounts";
import { createMockDb } from "@esposter/db-mock";
import { NotificationType, roomsInMessage, RoomType, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { MentionType } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

describe(decrementMentionCounts, () => {
  let db: Database;
  let mockDatabase: MockDatabase;
  const name = "name";
  const roomId = v7();
  const senderUserId = v7();
  const mentionedUserId = v7();
  // A message sent at one time, and members whose join and read times are set against it
  const sentAt = new Date(1000);
  const joinedBeforeAt = new Date(0);
  const joinedAfterAt = new Date(2000);
  const readAfterAt = new Date(2000);
  const message = createMention(mentionedUserId, MentionType.User);

  const insertMembership = (userId: string, createdAt: Date, lastReadAt: Date | null) =>
    db
      .insert(usersToRoomsInMessage)
      .values({
        createdAt,
        lastReadAt,
        mentionCount: 1,
        notificationType: NotificationType.DirectMessage,
        roomId,
        userId,
      });

  beforeAll(async () => {
    mockDatabase = await createMockDb();
    db = mockDatabase.db;
    await db.insert(usersInAuth).values([senderUserId, mentionedUserId].map((id) => createUser(id, new Date(0), name)));
    await db.insert(roomsInMessage).values({ id: roomId, name, type: RoomType.Room, userId: senderUserId });
  });

  afterEach(async () => {
    await db.delete(usersToRoomsInMessage).where(eq(usersToRoomsInMessage.roomId, roomId));
  });

  afterAll(async () => {
    await db.delete(usersInAuth);
    await db.delete(roomsInMessage);
  });

  test("takes back the count of a member the message mentioned, who has not read the room since, and no other's", async () => {
    expect.hasAssertions();

    await insertMembership(senderUserId, joinedBeforeAt, null);
    await insertMembership(mentionedUserId, joinedBeforeAt, null);

    const updatedUsersToRooms = await decrementMentionCounts(db, {
      createdAt: sentAt,
      editedAt: null,
      message,
      roomId,
      userId: senderUserId,
    });

    expect(updatedUsersToRooms.map(({ mentionCount, userId }) => ({ mentionCount, userId }))).toStrictEqual([
      { mentionCount: 0, userId: mentionedUserId },
    ]);
  });

  // A read clears the counts a member holds, so a count a later message made is the one still standing and must stay
  test("leaves the count of a member who has read the room since the message was sent", async () => {
    expect.hasAssertions();

    await insertMembership(mentionedUserId, joinedBeforeAt, readAfterAt);

    const updatedUsersToRooms = await decrementMentionCounts(db, {
      createdAt: sentAt,
      editedAt: null,
      message,
      roomId,
      userId: senderUserId,
    });

    expect(updatedUsersToRooms).toHaveLength(0);
    await expect(
      db
        .select({ mentionCount: usersToRoomsInMessage.mentionCount })
        .from(usersToRoomsInMessage)
        .where(eq(usersToRoomsInMessage.userId, mentionedUserId)),
    ).resolves.toStrictEqual([{ mentionCount: 1 }]);
  });

  // A member who joined after the message was sent was never counted for it, so there is no count of its to take back
  test("leaves out a member who joined the room after the message was sent", async () => {
    expect.hasAssertions();

    await insertMembership(mentionedUserId, joinedAfterAt, null);

    const updatedUsersToRooms = await decrementMentionCounts(db, {
      createdAt: sentAt,
      editedAt: null,
      message,
      roomId,
      userId: senderUserId,
    });

    expect(updatedUsersToRooms).toHaveLength(0);
  });

  test("takes no count below zero, and leaves a member at zero where it is", async () => {
    expect.hasAssertions();

    await insertMembership(mentionedUserId, joinedBeforeAt, null);
    await db
      .update(usersToRoomsInMessage)
      .set({ mentionCount: 0 })
      .where(eq(usersToRoomsInMessage.userId, mentionedUserId));

    const updatedUsersToRooms = await decrementMentionCounts(db, {
      createdAt: sentAt,
      editedAt: null,
      message,
      roomId,
      userId: senderUserId,
    });

    expect(updatedUsersToRooms).toHaveLength(0);
  });
});
