import type { Database } from "@esposter/db-schema";

import { deleteAccountMemberRoomReactions } from "#src/services/account/deleteAccountMemberRoomReactions";
import { getStreamTableClient } from "#src/services/streams/getStreamTableClient";
import { createUser } from "#src/services/shared/createUser.test";
import { serializeEntity } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  StreamTable,
  getReverseTickedTimestamp,
  MessageMetadataType,
  roomsInMessage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { jsonDateParse, takeOne } from "@esposter/shared";
import { MockTableDatabase } from "azure-mock";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

let mockDb: Database;

vi.mock(import("#src/services/shared/db"), () => ({
  get db() {
    return mockDb;
  },
}));
vi.mock(
  import("#src/services/streams/getStreamTableClient"),
  () => import("#src/services/streams/getStreamTableClient.test"),
);

const readUserIdsByRoom = (roomId: string) =>
  [...(MockTableDatabase.get(StreamTable.MessagesMetadata)?.values() ?? [])]
    .filter((entity) => entity.partitionKey === roomId)
    .map(({ userIds }) => jsonDateParse(String(userIds)));

describe(deleteAccountMemberRoomReactions, () => {
  const name = "name";
  const messageRowKey = getReverseTickedTimestamp();

  beforeAll(async () => {
    mockDb = (await createMockDb()).db;
  });

  afterEach(async () => {
    MockTableDatabase.clear();
    await mockDb.delete(usersInAuth);
  });

  test("takes the account off the reactions it shares, removes the ones it holds alone, and leaves rooms it is not in alone", async () => {
    expect.hasAssertions();

    const userId = crypto.randomUUID();
    const otherUserId = crypto.randomUUID();
    await mockDb.insert(usersInAuth).values([createUser(userId), createUser(otherUserId)]);
    const memberRoom = takeOne(await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning());
    const nonMemberRoom = takeOne(
      await mockDb.insert(roomsInMessage).values({ name, userId: otherUserId }).returning(),
    );
    await mockDb.insert(usersToRoomsInMessage).values([
      { roomId: memberRoom.id, userId },
      { roomId: memberRoom.id, userId: otherUserId },
    ]);
    const reactionClient = getStreamTableClient(StreamTable.MessagesMetadata);
    const createReaction = (roomId: string, userIds: string[]) => {
      const reaction = {
        emojiTag: "",
        messageRowKey,
        partitionKey: roomId,
        rowKey: getReverseTickedTimestamp(),
        type: MessageMetadataType.Emoji,
        userIds,
      };
      return reactionClient.createEntity(serializeEntity(reaction));
    };
    await createReaction(memberRoom.id, [userId]);
    await createReaction(memberRoom.id, [userId, otherUserId]);
    await createReaction(nonMemberRoom.id, [userId, otherUserId]);

    await deleteAccountMemberRoomReactions(userId);

    expect(readUserIdsByRoom(memberRoom.id)).toStrictEqual([[otherUserId]]);
    expect(readUserIdsByRoom(nonMemberRoom.id)).toStrictEqual([[userId, otherUserId]]);
  });
});
