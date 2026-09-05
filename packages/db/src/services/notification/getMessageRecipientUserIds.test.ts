import type { Database } from "@esposter/db-schema";

import { createMention } from "#src/services/message/createMention.test";
import { createUser } from "#src/services/message/createUser.test";
import { getMessageRecipientUserIds } from "#src/services/notification/getMessageRecipientUserIds";
import { createMockDb } from "@esposter/db-mock";
import {
  NotificationType,
  roomsInMessage,
  RoomType,
  threadFollowsInMessage,
  users,
  UserStatus,
  userStatusesInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { MENTION_EVERYONE_ID, MENTION_HERE_ID } from "@esposter/shared";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

describe(getMessageRecipientUserIds, () => {
  let db: Database;
  const name = "name";
  const roomId = crypto.randomUUID();
  const threadRootRowKey = "threadRootRowKey";
  const allOnlineUserId = crypto.randomUUID();
  const allOfflineUserId = crypto.randomUUID();
  const allNullStatusUserId = crypto.randomUUID();
  const directMessageOnlineUserId = crypto.randomUUID();
  const directMessageOfflineUserId = crypto.randomUUID();
  const neverUserId = crypto.randomUUID();
  const senderUserId = crypto.randomUUID();
  const sender = { partitionKey: roomId, userId: senderUserId };
  const userIds = [
    allOnlineUserId,
    allOfflineUserId,
    allNullStatusUserId,
    directMessageOnlineUserId,
    directMessageOfflineUserId,
    neverUserId,
    senderUserId,
  ];
  const allUserIds = [allOnlineUserId, allOfflineUserId, allNullStatusUserId];

  beforeAll(async () => {
    db = await createMockDb();
    await db.insert(users).values(userIds.map((id) => createUser(id, new Date(), name)));
    await db.insert(roomsInMessage).values({ id: roomId, name, type: RoomType.Room, userId: allOnlineUserId });
    await db.insert(usersToRoomsInMessage).values([
      { notificationType: NotificationType.All, roomId, userId: allOnlineUserId },
      { notificationType: NotificationType.All, roomId, userId: allOfflineUserId },
      { notificationType: NotificationType.All, roomId, userId: allNullStatusUserId },
      { notificationType: NotificationType.DirectMessage, roomId, userId: directMessageOnlineUserId },
      { notificationType: NotificationType.DirectMessage, roomId, userId: directMessageOfflineUserId },
      { notificationType: NotificationType.Never, roomId, userId: neverUserId },
      { notificationType: NotificationType.All, roomId, userId: senderUserId },
    ]);
    await db.insert(userStatusesInMessage).values([
      { status: UserStatus.Online, userId: allOnlineUserId },
      { status: UserStatus.Offline, userId: allOfflineUserId },
      { status: UserStatus.Online, userId: directMessageOnlineUserId },
      { status: UserStatus.Offline, userId: directMessageOfflineUserId },
      { status: UserStatus.Online, userId: neverUserId },
      { status: UserStatus.Online, userId: senderUserId },
      // The all-null-status user has no status row on purpose: a null status counts as online for @here
    ]);
    await db.insert(threadFollowsInMessage).values([
      // Follows the thread but is muted at room level, so the follow never overrides the mute
      { roomId, threadRootRowKey, userId: neverUserId },
      // Follows the thread on a DirectMessage preference — reached only because the reply is in their thread
      { roomId, threadRootRowKey, userId: directMessageOfflineUserId },
      // The replier follows their own thread, and is never notified of their own reply
      { roomId, threadRootRowKey, userId: senderUserId },
    ]);
  });

  afterAll(async () => {
    await db.delete(users);
  });

  test("no mention notifies All members excluding sender", async () => {
    expect.hasAssertions();

    const recipientUserIds = await getMessageRecipientUserIds(db, { ...sender, message: "" });

    expect(recipientUserIds.toSorted()).toStrictEqual(allUserIds.toSorted());
  });

  test("no userId notifies every All member without excluding a sender (webhook message)", async () => {
    expect.hasAssertions();

    const recipientUserIds = await getMessageRecipientUserIds(db, { message: "", partitionKey: roomId });

    expect(recipientUserIds.toSorted()).toStrictEqual([...allUserIds, senderUserId].toSorted());
  });

  test("regular mention notifies All and mentioned DirectMessage members", async () => {
    expect.hasAssertions();

    const recipientUserIds = await getMessageRecipientUserIds(db, {
      ...sender,
      message: createMention(directMessageOnlineUserId),
    });

    expect(recipientUserIds.toSorted()).toStrictEqual([...allUserIds, directMessageOnlineUserId].toSorted());
  });

  test("@everyone notifies All and DirectMessage members excluding Never and sender", async () => {
    expect.hasAssertions();

    const recipientUserIds = await getMessageRecipientUserIds(db, {
      ...sender,
      message: createMention(MENTION_EVERYONE_ID),
    });

    expect(recipientUserIds.toSorted()).toStrictEqual(
      [...allUserIds, directMessageOnlineUserId, directMessageOfflineUserId].toSorted(),
    );
  });

  test("@here notifies All and online DirectMessage members excluding offline DirectMessage and sender", async () => {
    expect.hasAssertions();

    const recipientUserIds = await getMessageRecipientUserIds(db, {
      ...sender,
      message: createMention(MENTION_HERE_ID),
    });

    expect(recipientUserIds.toSorted()).toStrictEqual([...allUserIds, directMessageOnlineUserId].toSorted());
  });

  test("a reply adds the thread's followers to the room's own recipients", async () => {
    expect.hasAssertions();

    const recipientUserIds = await getMessageRecipientUserIds(db, { ...sender, message: "", threadRootRowKey });

    // The muted follower and the replier stay out; the DirectMessage follower is reached only by the follow
    expect(recipientUserIds.toSorted()).toStrictEqual([...allUserIds, directMessageOfflineUserId].toSorted());
  });
});
