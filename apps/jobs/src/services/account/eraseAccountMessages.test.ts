import type { Database, ScheduledMessageInUser } from "@esposter/db-schema";

import { eraseAccountMessages } from "#src/services/account/eraseAccountMessages";
import { clearRoomObjectCalls, roomObjectCalls, roomObjectReplies } from "#src/services/room/getRoomObject.test";
import { OBJECT_READ_PAGE_LIMIT } from "#src/services/shared/constants";
import { createRoomMessage } from "#src/services/shared/createRoomMessage.test";
import { createUser } from "#src/services/shared/createUser.test";
import { clearMockBuckets, disposeMockBuckets, openMockBuckets } from "#src/services/storage/getBucket.test";
import { readBlobNames } from "#src/services/storage/readBlobNames.test";
import { seedBlob } from "#src/services/storage/seedBlob.test";
import { clearUserObjectCalls, userObjectCalls, userObjectReplies } from "#src/services/user/getUserObject.test";
import { getFileBlobNames } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  roomsInMessage,
  START_PAGE_CURSOR,
  StorageBucket,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { MENTION_ID_ATTRIBUTE, MENTION_TYPE, MENTION_TYPE_ATTRIBUTE, takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

let mockDb: Database;

// The mention span the editor writes for a member, as the count's targeting reads it
const createMention = (id: string) =>
  `<span ${MENTION_TYPE_ATTRIBUTE}="${MENTION_TYPE}" ${MENTION_ID_ATTRIBUTE}="${id}"></span>`;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/storage/getBucket"), () => import("#src/services/storage/getBucket.test"));
vi.mock(import("#src/services/room/getRoomObject"), () => import("#src/services/room/getRoomObject.test"));
vi.mock(import("#src/services/user/getUserObject"), () => import("#src/services/user/getUserObject.test"));

describe(eraseAccountMessages, () => {
  const filename = "filename";
  const name = "name";
  const createFile = () => ({
    filename,
    hasThumbnail: false,
    id: v7(),
    isSpoiler: false,
    mimetype: "mimetype",
    size: 0,
  });

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockBuckets([StorageBucket.MessageAssets]);
  });

  // The beforeEach answers the person's scheduled-message read with an empty page, so the sweep ends on its first page
  beforeEach(() => {
    userObjectReplies.set("readScheduledMessages", () => []);
  });

  afterEach(async () => {
    await clearMockBuckets();
    clearRoomObjectCalls();
    clearUserObjectCalls();
    await mockDb.delete(usersInAuth);
  });

  afterAll(async () => {
    await disposeMockBuckets();
  });

  test("takes back the mention counts its erased messages made for the members they named", async () => {
    expect.hasAssertions();

    const userId = v7();
    const mentionedUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(mentionedUserId)]);
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId }).returning());
    // The member was in the room before the message, and has not read the room since, so the message's count stands on them
    await mockDb.insert(usersToRoomsInMessage).values([
      { createdAt: new Date(0), mentionCount: 1, roomId: room.id, userId: mentionedUserId },
      { roomId: room.id, userId },
    ]);
    roomObjectReplies.set("deleteUserMessages", () => [
      createRoomMessage({ id: 1, message: createMention(mentionedUserId), userId }),
    ]);

    await eraseAccountMessages(userId);

    const [mentionedUserToRoom] = await mockDb
      .select({ mentionCount: usersToRoomsInMessage.mentionCount })
      .from(usersToRoomsInMessage)
      .where(eq(usersToRoomsInMessage.userId, mentionedUserId));
    expect(mentionedUserToRoom?.mentionCount).toBe(0);
  });

  test("erases the account's messages in each room it is a member of, and deletes only the blobs of the files it erased", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const memberRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    // A room the account is not in, with another person in it
    await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId });
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: memberRoom.id, userId },
      { roomId: memberRoom.id, userId: otherUserId },
    ]);

    // The erased message's file goes with it. The other person's file is in no message the account erased.
    // Its blob is never named by the erase, so it stays
    const targetFile = createFile();
    const otherUserFile = createFile();
    roomObjectReplies.set("deleteUserMessages", () => [createRoomMessage({ files: [targetFile], id: 1, userId })]);
    const scheduledMessage: ScheduledMessageInUser = { id: v7(), roomId: memberRoom.id, runAt: new Date(0) };
    userObjectReplies.set("readScheduledMessages", () => [scheduledMessage]);
    await seedBlob(StorageBucket.MessageAssets, getFileBlobNames(memberRoom.id, targetFile.id, filename).blobName);
    const otherUserBlobName = getFileBlobNames(memberRoom.id, otherUserFile.id, filename).blobName;
    await seedBlob(StorageBucket.MessageAssets, otherUserBlobName);

    await eraseAccountMessages(userId);

    expect(roomObjectCalls).toStrictEqual([
      {
        args: [{ after: undefined, limit: OBJECT_READ_PAGE_LIMIT, userId }],
        method: "deleteUserMessages",
        roomId: memberRoom.id,
      },
      { args: [scheduledMessage.id, { userId }], method: "deleteScheduledMessage", roomId: memberRoom.id },
    ]);
    expect(userObjectCalls).toStrictEqual([
      { args: [{ cursor: START_PAGE_CURSOR, limit: OBJECT_READ_PAGE_LIMIT }], method: "readScheduledMessages", userId },
    ]);
    await expect(readBlobNames(StorageBucket.MessageAssets)).resolves.toStrictEqual([otherUserBlobName]);
  });

  test("erases the messages of a room to their end across a page boundary, each page from the id the one before it ended on", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
    // The room's ids run from one, and it answers each page as the ids after the cursor it is sent, up to the limit
    const messages = Array.from({ length: OBJECT_READ_PAGE_LIMIT + 1 }, (_value, index) =>
      createRoomMessage({ id: index + 1, userId }),
    );
    roomObjectReplies.set("deleteUserMessages", (args) => {
      const { after } = z.object({ after: z.number().optional() }).parse(args[0]);
      return messages.filter(({ id }) => after === undefined || id > after).slice(0, OBJECT_READ_PAGE_LIMIT);
    });

    await eraseAccountMessages(userId);

    expect(roomObjectCalls).toStrictEqual([
      {
        args: [{ after: undefined, limit: OBJECT_READ_PAGE_LIMIT, userId }],
        method: "deleteUserMessages",
        roomId: room.id,
      },
      {
        args: [{ after: OBJECT_READ_PAGE_LIMIT, limit: OBJECT_READ_PAGE_LIMIT, userId }],
        method: "deleteUserMessages",
        roomId: room.id,
      },
    ]);
  });

  test("erases the scheduled messages the account's index names to its end, in the rooms they were set in, member or not", async () => {
    expect.hasAssertions();

    const userId = v7();
    const roomId = v7();
    await mockDb.insert(usersInAuth).values(createUser(userId));
    // The account is not a member of the room its scheduled messages were set in, and the index still names them. The index
    // Answers each page as the rows after the key it is sent, up to the limit, soonest first
    const scheduledMessages = Array.from({ length: OBJECT_READ_PAGE_LIMIT + 1 }, (_value, index) => ({
      id: v7(),
      roomId,
      runAt: new Date(index),
    }));
    userObjectReplies.set("readScheduledMessages", (args) => {
      const { cursor } = z
        .object({ cursor: z.object({ values: z.array(z.union([z.number(), z.string()])) }) })
        .parse(args[0]);
      const afterRunAt = cursor.values.length === 0 ? -1 : Number(cursor.values[0]);
      return scheduledMessages.filter(({ runAt }) => runAt.getTime() > afterRunAt).slice(0, OBJECT_READ_PAGE_LIMIT);
    });

    await eraseAccountMessages(userId);

    expect(
      roomObjectCalls
        .filter(({ method }) => method === "deleteScheduledMessage")
        .map(({ args, roomId: callRoomId }) => ({ callRoomId, id: args[0] })),
    ).toStrictEqual(scheduledMessages.map(({ id }) => ({ callRoomId: roomId, id })));
  });
});
