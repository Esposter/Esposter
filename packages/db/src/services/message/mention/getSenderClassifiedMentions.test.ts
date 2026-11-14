import type { Database } from "@esposter/db-schema";

import { createMention } from "#src/services/message/createMention.test";
import { createUser } from "#src/services/message/createUser.test";
import { getSenderClassifiedMentions } from "#src/services/message/mention/getSenderClassifiedMentions";
import { createMockDb } from "@esposter/db-mock";
import {
  RoomPermission,
  roomRolesInMessage,
  roomsInMessage,
  RoomType,
  usersInAuth,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { MENTION_EVERYONE_ID, MENTION_HERE_ID, MentionType } from "@esposter/shared";
import { v7 } from "uuid";
import { beforeAll, describe, expect, test } from "vitest";

describe(getSenderClassifiedMentions, () => {
  let db: Database;
  const name = "name";
  const roomId = v7();
  const roleId = v7();
  const ownerUserId = v7();
  const senderUserId = v7();
  const mentionEveryoneUserId = v7();
  const mentionedUserId = v7();

  beforeAll(async () => {
    db = await createMockDb();
    await db
      .insert(usersInAuth)
      .values(
        [ownerUserId, senderUserId, mentionEveryoneUserId, mentionedUserId].map((id) =>
          createUser(id, new Date(0), name),
        ),
      );
    await db.insert(roomsInMessage).values({ id: roomId, name, type: RoomType.Room, userId: ownerUserId });
    await db
      .insert(usersToRoomsInMessage)
      .values([senderUserId, mentionEveryoneUserId, mentionedUserId].map((userId) => ({ roomId, userId })));
    await db
      .insert(roomRolesInMessage)
      .values({ id: roleId, name, permissions: RoomPermission.MentionEveryone, roomId });
    await db.insert(usersToRoomRolesInMessage).values({ roleId, roomId, userId: mentionEveryoneUserId });
  });

  test.each([MENTION_EVERYONE_ID, MENTION_HERE_ID])(
    "drops a %s broadcast from a sender without MentionEveryone",
    async (broadcastId) => {
      expect.hasAssertions();

      const message = `${createMention(broadcastId)}${createMention(mentionedUserId, MentionType.User)}`;

      await expect(getSenderClassifiedMentions(db, roomId, senderUserId, message)).resolves.toStrictEqual({
        broadcastIds: [],
        regularUserIds: [mentionedUserId],
        roleIds: [],
      });
    },
  );

  test("keeps the broadcast of a sender with MentionEveryone", async () => {
    expect.hasAssertions();

    await expect(
      getSenderClassifiedMentions(db, roomId, mentionEveryoneUserId, createMention(MENTION_EVERYONE_ID)),
    ).resolves.toStrictEqual({ broadcastIds: [MENTION_EVERYONE_ID], regularUserIds: [], roleIds: [] });
  });

  test("keeps the broadcast of a message with no sender", async () => {
    expect.hasAssertions();

    await expect(getSenderClassifiedMentions(db, roomId, "", createMention(MENTION_HERE_ID))).resolves.toStrictEqual({
      broadcastIds: [MENTION_HERE_ID],
      regularUserIds: [],
      roleIds: [],
    });
  });
});
