import type { Database, RoomReaction } from "@esposter/db-schema";

import { deleteAccountMemberRoomReactions } from "#src/services/account/deleteAccountMemberRoomReactions";
import { clearRoomObjectCalls, roomObjectCalls, roomObjectReplies } from "#src/services/room/getRoomObject.test";
import { OBJECT_READ_PAGE_LIMIT } from "#src/services/shared/constants";
import { createUser } from "#src/services/shared/createUser.test";
import { createMockDb } from "@esposter/db-mock";
import { roomsInMessage, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/room/getRoomObject"), () => import("#src/services/room/getRoomObject.test"));

describe(deleteAccountMemberRoomReactions, () => {
  const emojiTag = "emojiTag";
  const name = "name";

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
  });

  // The beforeEach answers the room's reaction read with an empty page, so the removal ends on its first page
  beforeEach(() => {
    roomObjectReplies.set("deleteUserReactions", () => []);
  });

  afterEach(async () => {
    clearRoomObjectCalls();
    await mockDb.delete(usersInAuth);
  });

  test("asks each room the account is a member of to delete its reactions, and no room it is not in", async () => {
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

    await deleteAccountMemberRoomReactions(userId);

    expect(roomObjectCalls).toStrictEqual([
      {
        args: [{ after: undefined, limit: OBJECT_READ_PAGE_LIMIT, userId }],
        method: "deleteUserReactions",
        roomId: memberRoom.id,
      },
    ]);
  });

  test("deletes a room's reactions to their end across a page boundary, each page from the key the one before it ended on", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const room = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    await mockDb.insert(usersToRoomsInMessage).values({ roomId: room.id, userId });
    // The tags are padded so their order is the order the room keys them in. The room answers each page as the reactions
    // After the key it is sent, up to the limit
    const reactions: RoomReaction[] = Array.from({ length: OBJECT_READ_PAGE_LIMIT + 1 }, (_value, index) => ({
      emojiTag: `${emojiTag}${String(index).padStart(3, "0")}`,
      messageId: 1,
      userIds: [userId],
    }));
    roomObjectReplies.set("deleteUserReactions", (args) => {
      const { after } = z
        .object({ after: z.object({ emojiTag: z.string(), messageId: z.number() }).optional() })
        .parse(args[0]);
      return reactions
        .filter(({ emojiTag: tag }) => after === undefined || tag > after.emojiTag)
        .slice(0, OBJECT_READ_PAGE_LIMIT);
    });

    await deleteAccountMemberRoomReactions(userId);

    const lastReaction = reactions[OBJECT_READ_PAGE_LIMIT - 1];
    expect(roomObjectCalls).toStrictEqual([
      {
        args: [{ after: undefined, limit: OBJECT_READ_PAGE_LIMIT, userId }],
        method: "deleteUserReactions",
        roomId: room.id,
      },
      {
        args: [
          {
            after: { emojiTag: lastReaction?.emojiTag, messageId: lastReaction?.messageId },
            limit: OBJECT_READ_PAGE_LIMIT,
            userId,
          },
        ],
        method: "deleteUserReactions",
        roomId: room.id,
      },
    ]);
  });
});
