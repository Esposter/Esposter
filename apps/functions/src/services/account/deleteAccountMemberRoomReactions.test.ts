import type { Database } from "@esposter/db-schema";

import { deleteAccountMemberRoomReactions } from "#src/services/account/deleteAccountMemberRoomReactions";
import { createUser } from "#src/services/shared/createUser.test";
import { clearMockRooms, getRoomObject, openMockRooms } from "#src/services/room/getRoomObject.test";
import { createMockDb } from "@esposter/db-mock";
import { MessageType, roomsInMessage, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(import("#src/services/room/getRoomObject"), () => import("#src/services/room/getRoomObject.test"));

describe(deleteAccountMemberRoomReactions, () => {
  const emojiTag = "emojiTag";
  const message = "message";
  const name = "name";

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
    await openMockRooms();
  });

  afterEach(async () => {
    clearMockRooms();
    await mockDb.delete(usersInAuth);
  });

  test("takes the account off the reactions it shares, removes the ones it holds alone, and leaves rooms it is not in alone", async () => {
    expect.hasAssertions();

    const userId = v7();
    const otherUserId = v7();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const memberRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    const nonMemberRoom = takeOne(
      await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning(),
    );
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: memberRoom.id, userId },
      { roomId: memberRoom.id, userId: otherUserId },
    ]);

    // In the member room: a reaction the account holds alone, and one it shares with the other person
    const memberRoomObject = getRoomObject(memberRoom.id);
    const soloMessage = await memberRoomObject.createMessage(
      { message, type: MessageType.Message },
      { userId: otherUserId },
    );
    const sharedMessage = await memberRoomObject.createMessage(
      { message, type: MessageType.Message },
      { userId: otherUserId },
    );
    await memberRoomObject.addReaction({ emojiTag, messageId: soloMessage.id }, { userId });
    await memberRoomObject.addReaction({ emojiTag, messageId: sharedMessage.id }, { userId });
    await memberRoomObject.addReaction({ emojiTag, messageId: sharedMessage.id }, { userId: otherUserId });
    // In the room the account is not in, a reaction the account shares, which stays as it was
    const nonMemberRoomObject = getRoomObject(nonMemberRoom.id);
    const nonMemberMessage = await nonMemberRoomObject.createMessage(
      { message, type: MessageType.Message },
      { userId: otherUserId },
    );
    await nonMemberRoomObject.addReaction({ emojiTag, messageId: nonMemberMessage.id }, { userId });
    await nonMemberRoomObject.addReaction({ emojiTag, messageId: nonMemberMessage.id }, { userId: otherUserId });

    await deleteAccountMemberRoomReactions(userId);

    expect(memberRoomObject.readReactions([soloMessage.id, sharedMessage.id])).toStrictEqual([
      { emojiTag, messageId: sharedMessage.id, userIds: [otherUserId] },
    ]);
    expect(nonMemberRoomObject.readReactions([nonMemberMessage.id])).toStrictEqual([
      { emojiTag, messageId: nonMemberMessage.id, userIds: [userId, otherUserId] },
    ]);
  });
});
