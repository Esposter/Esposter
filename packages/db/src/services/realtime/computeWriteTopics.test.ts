import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { Database } from "@esposter/db-schema";

import { computeWriteTopics } from "#src/services/realtime/computeWriteTopics";
import { insertUser } from "#src/services/realtime/insertUser.test";
import { recordStatements } from "#src/services/realtime/recordStatements";
import { createMockDb } from "@esposter/db-mock";
import {
  appUsersInMessage,
  bookmarksInApp,
  invitesInMessage,
  NotificationType,
  postsInPost,
  resourcesInResource,
  ResourceType,
  roomMemberPermissionsInMessage,
  roomRolesInMessage,
  roomsInMessage,
  RoomType,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
  webhooksInMessage,
} from "@esposter/db-schema";
import { SECRET_TOKEN_LENGTH } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// A room and its owner, the rows a membership or an invite names
const insertRoom = async (db: Database, roomId: string, userId: string) => {
  await insertUser(db, userId);
  await db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
};

// A user's membership of a room, at the notification level a direct message room starts with
const insertMember = async (db: Database, roomId: string, userId: string) => {
  await db.insert(usersToRoomsInMessage).values({ notificationType: NotificationType.DirectMessage, roomId, userId });
};

// The names of the topics a write publishes, for a golden that records which topics a write names
const getWriteTopicNames = async (statements: RecordedStatement[]) =>
  (await computeWriteTopics(statements)).map(({ topic }) => topic);

describe(computeWriteTopics, () => {
  // The child tables a resource delete cascades to, transitively: its versions cascade to their assets, so a delete of
  // The resource changes twelve tables its foreign keys name directly and thirteen with that grandchild
  const cascadingResourceTables = [
    "app_bookmarks",
    "resource_programParticipants",
    "resource_resourceAccesses",
    "resource_resourceActivities",
    "resource_resourceFavorites",
    "resource_resourceLinks",
    "resource_resourceObjectLocks",
    "resource_resourcePublications",
    "resource_resourceVersionAssets",
    "resource_resourceVersions",
    "resource_resourceViews",
    "resource_resourceWorkingAssets",
    "resource_surveyResponses",
  ];

  // An insert names the scope values of the rows it returns, and its table-wide topic, whatever the table's rows hold
  test("an insert names the scope values of each row it returns and its table's topic", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const userId = v7();
    await insertRoom(db, roomId, userId);
    const { database, statements } = recordStatements(db);

    await database
      .insert(usersToRoomsInMessage)
      .values({ notificationType: NotificationType.DirectMessage, roomId, userId })
      .returning();

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual([
      "message_usersToRooms:*",
      `message_usersToRooms:roomId=${roomId}`,
      `message_usersToRooms:userId=${userId}`,
    ]);
  });

  // The caller's RETURNING names only `userId`, which left out the room that scopes the row, so a write must name the
  // Scope values Of the rows it returns whatever columns the caller asked for, and the caller is answered only the
  // Columns it asked for
  test("a write that returns only some of its columns still names the scope values of the rows it returns", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const userId = v7();
    await insertRoom(db, roomId, userId);
    await insertMember(db, roomId, userId);
    await db.insert(roomMemberPermissionsInMessage).values({ roomId, userId });
    const { database, statements } = recordStatements(db);

    await expect(
      database
        .update(roomMemberPermissionsInMessage)
        .set({ deny: 2n })
        .where(eq(roomMemberPermissionsInMessage.userId, userId))
        .returning({ userId: roomMemberPermissionsInMessage.userId }),
    ).resolves.toStrictEqual([{ userId }]);

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual([
      "message_roomMemberPermissions:*",
      `message_roomMemberPermissions:roomId=${roomId}`,
      `message_roomMemberPermissions:userId=${userId}`,
    ]);
  });

  // An update names the scope values of the rows its WHERE matches, whatever its SET writes and whatever RETURNING its
  // Caller Asked for. A caller that remembered no RETURNING must not leave a reader of one room's rows unwoken by the
  // Room's update
  test("an update that asks for no RETURNING and writes no scope column names the scope values of the rows it changes", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const userId = v7();
    await insertRoom(db, roomId, userId);
    await insertMember(db, roomId, userId);
    const { database, statements } = recordStatements(db);

    await database
      .update(usersToRoomsInMessage)
      .set({ isHidden: true })
      .where(eq(usersToRoomsInMessage.userId, userId));

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual([
      "message_usersToRooms:*",
      `message_usersToRooms:roomId=${roomId}`,
      `message_usersToRooms:userId=${userId}`,
    ]);
  });

  // An insert that asks for no RETURNING, as a role assignment writes its membership, names the scope values of the
  // Rows its values Hold, since those are the rows it writes. A table-wide topic alone would not wake a read that
  // Watches one room's rows
  test("an insert that asks for no RETURNING names the scope values of the rows it writes", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const userId = v7();
    const roleId = v7();
    await insertRoom(db, roomId, userId);
    await insertMember(db, roomId, userId);
    await db.insert(roomRolesInMessage).values({ id: roleId, name: "a", permissions: 0n, roomId });
    const { database, statements } = recordStatements(db);

    await database.insert(usersToRoomRolesInMessage).values({ roleId, roomId, userId }).onConflictDoNothing();

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual([
      "message_usersToRoomRoles:*",
      `message_usersToRoomRoles:roomId=${roomId}`,
      `message_usersToRoomRoles:userId=${userId}`,
    ]);
  });

  // An update names the values its rows hold after it, which is what a reader of the row now reads
  test("an update names the scope values of the rows it returns", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const userId = v7();
    await insertRoom(db, roomId, userId);
    await insertMember(db, roomId, userId);
    const { database, statements } = recordStatements(db);

    await database
      .update(usersToRoomsInMessage)
      .set({ displayName: "renamed" })
      .where(eq(usersToRoomsInMessage.userId, userId))
      .returning();

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual([
      "message_usersToRooms:*",
      `message_usersToRooms:roomId=${roomId}`,
      `message_usersToRooms:userId=${userId}`,
    ]);
  });

  // An upsert writes its row whichever branch it takes, so a conflict that updates a row names that row too
  test("an upsert names the row it writes when it updates an existing row", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const userId = v7();
    await insertRoom(db, roomId, userId);
    await insertMember(db, roomId, userId);
    const { database, statements } = recordStatements(db);

    await database
      .insert(usersToRoomsInMessage)
      .values({ notificationType: NotificationType.Never, roomId, userId })
      .onConflictDoUpdate({
        set: { notificationType: NotificationType.Never },
        target: [usersToRoomsInMessage.userId, usersToRoomsInMessage.roomId],
      })
      .returning();

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual([
      "message_usersToRooms:*",
      `message_usersToRooms:roomId=${roomId}`,
      `message_usersToRooms:userId=${userId}`,
    ]);
  });

  // A resource delete changes its own row and every row its foreign keys cascade to. RETURNING does not report the
  // Cascaded Rows, so each child table is named table-wide, and each row a child holds is named by its scope values,
  // Which the Walk reads before the delete. A child table with no row of the resource is named table-wide alone
  test("a delete names the scope values of the rows it deletes and of the child rows its foreign keys cascade to", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const resourceId = v7();
    const userId = v7();
    const bookmarkerId = v7();
    await insertUser(db, userId);
    await insertUser(db, bookmarkerId);
    await db.insert(resourcesInResource).values({ id: resourceId, name: resourceId, type: ResourceType.Note, userId });
    await db.insert(bookmarksInApp).values({ path: "a", resourceId, title: "a", userId: bookmarkerId });
    const { database, statements } = recordStatements(db);

    await database.delete(resourcesInResource).where(eq(resourcesInResource.id, resourceId)).returning();

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual(
      [
        "resource_resources:*",
        `resource_resources:id=${resourceId}`,
        `resource_resources:userId=${userId}`,
        `app_bookmarks:resourceId=${resourceId}`,
        `app_bookmarks:userId=${bookmarkerId}`,
        ...cascadingResourceTables.map((tableName) => `${tableName}:*`),
      ].toSorted(),
    );
  });

  // An invite's id is the secret its link carries, so its topic names the id by a digest of it. The digest is the
  // Sha-256 of the id, twelve hex characters after `sha256:`, and the id never appears in a topic
  test("a secret scope value is named by its digest and never by the value itself", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const userId = v7();
    const inviteId = "a".repeat(SECRET_TOKEN_LENGTH);
    await insertRoom(db, roomId, userId);
    await db.insert(invitesInMessage).values({ id: inviteId, roomId, userId });
    const { database, statements } = recordStatements(db);

    await database.delete(invitesInMessage).where(eq(invitesInMessage.id, inviteId)).returning();

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual([
      "message_invites:*",
      "message_invites:id=sha256:66d34fba71f8",
      `message_invites:roomId=${roomId}`,
    ]);
  });

  // Each statement of a batch is a write of its own, so the topics of every row a batch's statements return are named
  test("a batch names the rows each of its statements returns", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const userId = v7();
    const joinerId = v7();
    await insertRoom(db, roomId, userId);
    await insertUser(db, joinerId);
    await insertMember(db, roomId, userId);
    const { database, statements } = recordStatements(db);

    await database.batch([
      database
        .insert(usersToRoomsInMessage)
        .values({ notificationType: NotificationType.DirectMessage, roomId, userId: joinerId })
        .returning(),
      database
        .update(usersToRoomsInMessage)
        .set({ displayName: "renamed" })
        .where(eq(usersToRoomsInMessage.userId, userId))
        .returning(),
    ]);

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual(
      [
        "message_usersToRooms:*",
        `message_usersToRooms:roomId=${roomId}`,
        `message_usersToRooms:userId=${joinerId}`,
        `message_usersToRooms:userId=${userId}`,
      ].toSorted(),
    );
  });

  // A write that matches no row changes nothing, so it publishes nothing
  test("a write that changes no row names no topic", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const { database, statements } = recordStatements(db);

    await database
      .update(usersToRoomsInMessage)
      .set({ displayName: "renamed" })
      .where(eq(usersToRoomsInMessage.userId, v7()))
      .returning();

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual([]);
  });

  // An update that moves a row out of a scope value changes what a reader of the old value holds. RETURNING names only
  // The values the row holds after the update, so the values it held before are read first, with the update's own WHERE
  test("an update that moves a row out of a scope value names the old value as well as the new one", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const otherRoomId = v7();
    const userId = v7();
    await insertRoom(db, roomId, userId);
    await insertRoom(db, otherRoomId, v7());
    await insertMember(db, roomId, userId);
    const { database, statements } = recordStatements(db);

    await database
      .update(usersToRoomsInMessage)
      .set({ roomId: otherRoomId })
      .where(eq(usersToRoomsInMessage.userId, userId))
      .returning();

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual(
      [
        "message_usersToRooms:*",
        `message_usersToRooms:roomId=${roomId}`,
        `message_usersToRooms:roomId=${otherRoomId}`,
        `message_usersToRooms:userId=${userId}`,
      ].toSorted(),
    );
  });

  // Without RETURNING the recorder widens the update to return its scope columns (`widenUnreturnedWrite`), so the
  // Values its rows Hold after it are known as well as the values they held before it, which are read ahead of it. A
  // Reader of either is woken
  test("an update that asks for no RETURNING names the scope values its rows held before it, and the ones it sets", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const otherRoomId = v7();
    const userId = v7();
    await insertRoom(db, roomId, userId);
    await insertRoom(db, otherRoomId, v7());
    await insertMember(db, roomId, userId);
    const { database, statements } = recordStatements(db);

    await database
      .update(usersToRoomsInMessage)
      .set({ roomId: otherRoomId })
      .where(eq(usersToRoomsInMessage.userId, userId));

    // The row moves from `roomId` to `otherRoomId`, so a read of either room is woken
    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual(
      [
        "message_usersToRooms:*",
        `message_usersToRooms:roomId=${roomId}`,
        `message_usersToRooms:roomId=${otherRoomId}`,
        `message_usersToRooms:userId=${userId}`,
      ].toSorted(),
    );
  });

  // A child row whose key is not a scope column is not named by its key's value, so the delete reads the child rows it
  // Removes before it runs. A webhook is cascaded from its app user through a key the room's list does not watch
  test("a delete names the scope values of the child rows cascaded through a key that is not a scope column", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const userId = v7();
    const appUserId = v7();
    await insertRoom(db, roomId, userId);
    await db.insert(appUsersInMessage).values({ id: appUserId });
    await db
      .insert(webhooksInMessage)
      .values({ creatorId: userId, name: "a", roomId, tokenHash: "a", userId: appUserId });
    const { database, statements } = recordStatements(db);

    await database.delete(appUsersInMessage).where(eq(appUsersInMessage.id, appUserId)).returning();

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual(
      ["message_appUsers:*", "message_webhooks:*", `message_webhooks:roomId=${roomId}`].toSorted(),
    );
  });

  // The same delete in a batch reads its child rows inside the batch, before the delete it precedes, so it names them
  // Too
  test("a delete in a batch names the scope values of the child rows it cascades to", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const userId = v7();
    const appUserId = v7();
    await insertRoom(db, roomId, userId);
    await db.insert(appUsersInMessage).values({ id: appUserId });
    await db
      .insert(webhooksInMessage)
      .values({ creatorId: userId, name: "a", roomId, tokenHash: "a", userId: appUserId });
    const { database, statements } = recordStatements(db);

    await database.batch([database.delete(appUsersInMessage).where(eq(appUsersInMessage.id, appUserId)).returning()]);

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual(
      ["message_appUsers:*", "message_webhooks:*", `message_webhooks:roomId=${roomId}`].toSorted(),
    );
  });

  // A grant is held by a role, and a role by the room, so a room's delete reaches the grant two keys down. The grant's
  // Room and member values are read through the role, and the grant table is named table-wide like every cascaded table
  test("a delete names the scope values of the grandchild rows its cascade reaches through a role", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const userId = v7();
    const roleId = v7();
    await insertRoom(db, roomId, userId);
    await insertMember(db, roomId, userId);
    await db.insert(roomRolesInMessage).values({ id: roleId, name: "a", permissions: 0n, roomId });
    await db.insert(usersToRoomRolesInMessage).values({ roleId, roomId, userId });
    const { database, statements } = recordStatements(db);

    await database.delete(roomsInMessage).where(eq(roomsInMessage.id, roomId)).returning();

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual(
      [
        "app_bookmarks:*",
        "message_bans:*",
        "message_callSessions:*",
        "message_invites:*",
        "message_moderationLogs:*",
        "message_moderationNotes:*",
        "message_roomEmojis:*",
        "message_roomFilters:*",
        "message_roomMemberPermissions:*",
        "message_roomRoles:*",
        `message_roomRoles:roomId=${roomId}`,
        "message_rooms:*",
        `message_rooms:id=${roomId}`,
        "message_searchHistories:*",
        "message_threadFollows:*",
        "message_usersToRoomRoles:*",
        `message_usersToRoomRoles:roomId=${roomId}`,
        `message_usersToRoomRoles:userId=${userId}`,
        "message_usersToRooms:*",
        `message_usersToRooms:roomId=${roomId}`,
        `message_usersToRooms:userId=${userId}`,
        "message_webhooks:*",
      ].toSorted(),
    );
  });

  // A reply tree cascades through its own table, so a delete of a post removes its replies, and the replies of those.
  // The replies' scope values are read through the same walk, whatever depth they sit at
  test("a delete names the scope values of every reply its post's reply tree cascades to", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    const replierId = v7();
    const nestedReplierId = v7();
    const postId = v7();
    const replyId = v7();
    const nestedReplyId = v7();
    await insertUser(db, userId);
    await insertUser(db, replierId);
    await insertUser(db, nestedReplierId);
    await db.insert(postsInPost).values({ id: postId, ranking: 0, userId });
    await db.insert(postsInPost).values({ id: replyId, parentId: postId, ranking: 0, userId: replierId });
    await db.insert(postsInPost).values({ id: nestedReplyId, parentId: replyId, ranking: 0, userId: nestedReplierId });
    const { database, statements } = recordStatements(db);

    await database.delete(postsInPost).where(eq(postsInPost.id, postId)).returning();

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual(
      [
        "post_posts:*",
        `post_posts:id=${postId}`,
        `post_posts:id=${replyId}`,
        `post_posts:id=${nestedReplyId}`,
        `post_posts:parentId=${postId}`,
        `post_posts:parentId=${replyId}`,
        `post_posts:userId=${userId}`,
        `post_posts:userId=${replierId}`,
        `post_posts:userId=${nestedReplierId}`,
        "post_likes:*",
      ].toSorted(),
    );
  });

  // A read changes nothing, so a query that awaits through the handle names no write topic
  test("a read names no write topic", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const { database, statements } = recordStatements(db);

    await database.select().from(roomsInMessage);

    await expect(getWriteTopicNames(statements)).resolves.toStrictEqual([]);
  });
});
