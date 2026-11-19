import type { Database } from "@esposter/db-schema";

import { createMockAuthSession, createMockContext, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { bookmarkRouter } from "#server/trpc/routers/bookmark";
import { friendRouter } from "#server/trpc/routers/friend";
import { inviteRouter } from "#server/trpc/routers/invite";
import { postRouter } from "#server/trpc/routers/post";
import { roomRouter } from "#server/trpc/routers/room/index";
import {
  computeReadSet,
  computeReadTopics,
  getSchemaTables,
  getWokenTopics,
  computeWriteTopics,
  recordStatements,
} from "@esposter/db";
import {
  bookmarksInApp,
  NotificationType,
  resourcesInResource,
  ResourceType,
  roomsInMessage,
  RoomType,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { and, eq, getTableName } from "drizzle-orm";
import { SQLiteDialect } from "drizzle-orm/sqlite-core";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// A direct message the viewer and one other member share, which the viewer's sidebar lists unless the viewer has hidden it
const createSharedDirectMessage = async (
  context: Awaited<ReturnType<typeof createMockContext>>,
  { isHidden = false }: { isHidden?: boolean } = {},
) => {
  const reader = await createMockAuthSession(context.db);
  const joiner = await createMockAuthSession(context.db);
  const directMessageId = v7();
  await context.db
    .insert(roomsInMessage)
    .values({
      id: directMessageId,
      name: "",
      participantKey: directMessageId,
      type: RoomType.DirectMessage,
      userId: reader.user.id,
    });
  await context.db.insert(usersToRoomsInMessage).values([
    { isHidden, notificationType: NotificationType.DirectMessage, roomId: directMessageId, userId: reader.user.id },
    { notificationType: NotificationType.DirectMessage, roomId: directMessageId, userId: joiner.user.id },
  ]);
  return { directMessageId, joiner, reader };
};

// The sidebar's topics, read as the viewer, and the topics a write publishes, for the write that follows the read
const recordSidebarRead = async (
  context: Awaited<ReturnType<typeof createMockContext>>,
  reader: Awaited<ReturnType<typeof createMockAuthSession>>,
) => {
  const read = recordStatements(context.db);
  await createCallerFactory(roomRouter)({
    ...context,
    db: read.database,
    session: reader.session,
    user: reader.user,
  }).readRooms({ includeDirectMessages: true });
  return read;
};

describe("topicMatch", () => {
  // A read's read set names every table its SQL reads. A table the walker misses is one the read never watches, and no
  // Test of a single read's rows would show it, so the five reads the golden read sets pin are checked against their SQL
  test("every table a read's SQL names is one its read set names, for each of the five reads", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const reader = await createMockAuthSession(context.db);
    const room = await createCallerFactory(roomRouter)(context).createRoom({ name: "room" });
    const invite = await createCallerFactory(inviteRouter)(context).createInvite({
      expireAfterMinutes: 0,
      maxUses: 0,
      roomId: room.id,
    });
    const schemaTableNames = getSchemaTables().map((table) => getTableName(table));
    const reads: ((database: Database) => Promise<unknown>)[] = [
      (database) => createCallerFactory(bookmarkRouter)({ ...context, db: database }).readBookmarks(),
      (database) => createCallerFactory(postRouter)({ ...context, db: database }).readPosts(),
      (database) => createCallerFactory(roomRouter)({ ...context, db: database }).readRooms(),
      (database) => createCallerFactory(friendRouter)({ ...context, db: database }).searchUsers("User"),
      (database) =>
        createCallerFactory(inviteRouter)({
          ...context,
          db: database,
          session: reader.session,
          user: reader.user,
        }).readInvite(invite.id),
    ];

    const uncoveredTables = (
      await Promise.all(
        reads.map(async (read) => {
          const { database, statements } = recordStatements(context.db);
          await read(database);
          const readTableNames = new Set(computeReadSet(statements).tables);
          return statements.flatMap(({ statement }) => {
            const sql = new SQLiteDialect().sqlToQuery(statement.getSQL()).sql;
            return schemaTableNames.filter(
              (tableName) => sql.includes(`"${tableName}"`) && !readTableNames.has(tableName),
            );
          });
        }),
      )
    ).flat();

    expect(uncoveredTables).toStrictEqual([]);
  });

  // The dock reads a bookmarked resource's owner, type and recycle-bin state through a join, never its name, so a rename of
  // The resource changes no column the dock reads and wakes it through no topic
  test("a rename of a bookmarked resource wakes no one, since the bookmark dock does not read the resource's name", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const context = await createMockContext();
    const resourceId = v7();
    await context.db
      .insert(resourcesInResource)
      .values({ id: resourceId, name: resourceId, type: ResourceType.Note, userId });
    await context.db.insert(bookmarksInApp).values({ path: `/${resourceId}`, resourceId, title: resourceId, userId });
    const read = recordStatements(context.db);
    await createCallerFactory(bookmarkRouter)({ ...context, db: read.database }).readBookmarks();
    const write = recordStatements(context.db);

    await write.database
      .update(resourcesInResource)
      .set({ name: "renamed" })
      .where(eq(resourcesInResource.id, resourceId));

    expect(
      getWokenTopics(await computeReadTopics(read.statements), await computeWriteTopics(write.statements)),
    ).toStrictEqual([]);
  });

  // The dock reads the viewer's own memberships of the rooms it bookmarks, by their room and their user. Removing one is a
  // Row-set change, which wakes the dock whichever columns it reads
  test("the viewer leaving a room the bookmark dock reads wakes the dock through the viewer's membership", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const context = await createMockContext();
    const roomId = v7();
    await context.db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
    await context.db
      .insert(usersToRoomsInMessage)
      .values({ notificationType: NotificationType.DirectMessage, roomId, userId });
    await context.db.insert(bookmarksInApp).values({ path: `/${roomId}`, roomId, title: roomId, userId });
    const read = recordStatements(context.db);
    await createCallerFactory(bookmarkRouter)({ ...context, db: read.database }).readBookmarks();
    const write = recordStatements(context.db);

    await write.database
      .delete(usersToRoomsInMessage)
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, userId)));

    expect(
      getWokenTopics(await computeReadTopics(read.statements), await computeWriteTopics(write.statements)),
    ).toStrictEqual([`message_usersToRooms:userId=${userId}`]);
  });

  // The dock does not read a membership's display name, so renaming the viewer's membership wakes it through no topic
  test("an update to a membership column the bookmark dock does not read wakes no one", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const context = await createMockContext();
    const roomId = v7();
    await context.db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
    await context.db
      .insert(usersToRoomsInMessage)
      .values({ notificationType: NotificationType.DirectMessage, roomId, userId });
    await context.db.insert(bookmarksInApp).values({ path: `/${roomId}`, roomId, title: roomId, userId });
    const read = recordStatements(context.db);
    await createCallerFactory(bookmarkRouter)({ ...context, db: read.database }).readBookmarks();
    const write = recordStatements(context.db);

    await write.database
      .update(usersToRoomsInMessage)
      .set({ displayName: "renamed" })
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, userId)));

    expect(
      getWokenTopics(await computeReadTopics(read.statements), await computeWriteTopics(write.statements)),
    ).toStrictEqual([]);
  });

  // The landing page counts its room's members, which another member's join changes. The page reads the count through
  // Its room's memberships, so the join wakes it
  test("another member joining the invite's room wakes the invite's landing page", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const room = await createCallerFactory(roomRouter)(context).createRoom({ name: "room" });
    const invite = await createCallerFactory(inviteRouter)(context).createInvite({
      expireAfterMinutes: 0,
      maxUses: 0,
      roomId: room.id,
    });
    const reader = await createMockAuthSession(context.db);
    const joiner = await createMockAuthSession(context.db);
    const read = recordStatements(context.db);
    await createCallerFactory(inviteRouter)({
      ...context,
      db: read.database,
      session: reader.session,
      user: reader.user,
    }).readInvite(invite.id);
    const write = recordStatements(context.db);

    await write.database
      .insert(usersToRoomsInMessage)
      .values({ notificationType: NotificationType.DirectMessage, roomId: room.id, userId: joiner.user.id });

    expect(
      getWokenTopics(await computeReadTopics(read.statements), await computeWriteTopics(write.statements)),
    ).toStrictEqual([`message_usersToRooms:roomId=${room.id}`]);
  });

  // The dock leaves out a bookmark whose resource is in the recycle bin, and the other bookmark it holds keeps the dock's
  // Rows, so the dock's read names the rows' resource values. Restoring the binned resource brings its bookmark back, and only
  // The resource table's own topic names that restore
  test("restoring a binned resource wakes the bookmark dock that leaves its bookmark out", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const context = await createMockContext();
    const bookedResourceId = v7();
    const binnedResourceId = v7();
    await context.db.insert(resourcesInResource).values([
      { id: bookedResourceId, name: bookedResourceId, type: ResourceType.Note, userId },
      { deletedAt: new Date(), id: binnedResourceId, name: binnedResourceId, type: ResourceType.Note, userId },
    ]);
    await context.db.insert(bookmarksInApp).values([
      { path: `/${bookedResourceId}`, resourceId: bookedResourceId, title: bookedResourceId, userId },
      { path: `/${binnedResourceId}`, resourceId: binnedResourceId, title: binnedResourceId, userId },
    ]);
    const read = recordStatements(context.db);
    await createCallerFactory(bookmarkRouter)({ ...context, db: read.database }).readBookmarks();
    const write = recordStatements(context.db);

    await write.database
      .update(resourcesInResource)
      .set({ deletedAt: null })
      .where(eq(resourcesInResource.id, binnedResourceId));

    expect(
      getWokenTopics(await computeReadTopics(read.statements), await computeWriteTopics(write.statements)),
    ).toStrictEqual([`${getTableName(resourcesInResource)}:*`]);
  });

  // The sidebar names the memberships of each room it lists by that room, so another member joining a listed room wakes the
  // Sidebar through that room's topic, not the memberships table's
  test("another member joining a room the viewer lists wakes the sidebar through that room's topic", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const reader = await createMockAuthSession(context.db);
    const readerContext = { ...context, session: reader.session, user: reader.user };
    const room = await createCallerFactory(roomRouter)(readerContext).createRoom({ name: "room" });
    const joiner = await createMockAuthSession(context.db);
    const read = recordStatements(context.db);
    await createCallerFactory(roomRouter)({ ...readerContext, db: read.database }).readRooms();
    const write = recordStatements(context.db);

    await write.database
      .insert(usersToRoomsInMessage)
      .values({ notificationType: NotificationType.DirectMessage, roomId: room.id, userId: joiner.user.id });

    expect(
      getWokenTopics(await computeReadTopics(read.statements), await computeWriteTopics(write.statements)),
    ).toStrictEqual([`message_usersToRooms:roomId=${room.id}`]);
  });

  // A direct message the viewer has hidden is not in the sidebar. Unhiding it is a write to the viewer's own membership, which
  // Wakes the sidebar through the viewer's scope, and the sidebar's refetch names the participants of the room it now shows
  test("unhiding a direct message wakes the sidebar, and its refetch names that room's participants", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { directMessageId, reader } = await createSharedDirectMessage(context, { isHidden: true });
    const readerContext = { ...context, session: reader.session, user: reader.user };
    await createCallerFactory(roomRouter)(readerContext).createRoom({ name: "room" });
    const read = await recordSidebarRead(context, reader);
    const write = recordStatements(context.db);

    await write.database
      .update(usersToRoomsInMessage)
      .set({ isHidden: false })
      .where(and(eq(usersToRoomsInMessage.roomId, directMessageId), eq(usersToRoomsInMessage.userId, reader.user.id)));

    expect(
      getWokenTopics(await computeReadTopics(read.statements), await computeWriteTopics(write.statements)),
    ).toStrictEqual([`message_usersToRooms:userId=${reader.user.id}`]);
    const refetch = recordStatements(context.db);
    const { items } = await createCallerFactory(roomRouter)({ ...readerContext, db: refetch.database }).readRooms({
      includeDirectMessages: true,
    });
    const refetchTopics = (await computeReadTopics(refetch.statements)).map(({ topic }) => topic);

    expect(items.map(({ id }) => id)).toContain(directMessageId);
    expect(refetchTopics).toContain(`message_usersToRooms:roomId=${directMessageId}`);
    expect(refetchTopics).not.toContain("message_usersToRooms:*");
  });

  // The read inner-joins the memberships, so it returns the rooms that have a member and names the memberships by those rooms.
  // A room with no member yet gains its first, a membership of a value the read does not return, so only the memberships'
  // Own table topic reaches the read
  test("a room gaining its first member wakes a read that inner-joins the memberships", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const context = await createMockContext();
    const memberedRoomId = v7();
    const emptyRoomId = v7();
    await context.db.insert(roomsInMessage).values([
      { id: memberedRoomId, name: memberedRoomId, type: RoomType.Room, userId },
      { id: emptyRoomId, name: emptyRoomId, type: RoomType.Room, userId },
    ]);
    await context.db
      .insert(usersToRoomsInMessage)
      .values({ notificationType: NotificationType.DirectMessage, roomId: memberedRoomId, userId });
    const read = recordStatements(context.db);
    await read.database
      .select({ id: roomsInMessage.id })
      .from(roomsInMessage)
      .innerJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id));
    const write = recordStatements(context.db);

    await write.database
      .insert(usersToRoomsInMessage)
      .values({ notificationType: NotificationType.DirectMessage, roomId: emptyRoomId, userId });

    expect(
      getWokenTopics(await computeReadTopics(read.statements), await computeWriteTopics(write.statements)),
    ).toStrictEqual(["message_usersToRooms:*"]);
  });

  // The read filters the memberships to the ones not hidden, so it returns the rooms whose membership is visible and names
  // Them by those rooms. Unhiding a hidden membership brings its room back, a value the read does not return, so only the
  // Memberships' own table topic reaches the read
  test("unhiding a membership wakes a read that filters the memberships by it", async () => {
    expect.hasAssertions();

    const userId = getMockSession().user.id;
    const context = await createMockContext();
    const visibleRoomId = v7();
    const hiddenRoomId = v7();
    await context.db.insert(roomsInMessage).values([
      { id: visibleRoomId, name: visibleRoomId, type: RoomType.Room, userId },
      { id: hiddenRoomId, name: hiddenRoomId, type: RoomType.Room, userId },
    ]);
    await context.db.insert(usersToRoomsInMessage).values([
      { isHidden: false, notificationType: NotificationType.DirectMessage, roomId: visibleRoomId, userId },
      { isHidden: true, notificationType: NotificationType.DirectMessage, roomId: hiddenRoomId, userId },
    ]);
    const read = recordStatements(context.db);
    await read.database
      .select({ id: roomsInMessage.id })
      .from(roomsInMessage)
      .leftJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id))
      .where(eq(usersToRoomsInMessage.isHidden, false));
    const write = recordStatements(context.db);

    await write.database
      .update(usersToRoomsInMessage)
      .set({ isHidden: false })
      .where(and(eq(usersToRoomsInMessage.roomId, hiddenRoomId), eq(usersToRoomsInMessage.userId, userId)));

    expect(
      getWokenTopics(await computeReadTopics(read.statements), await computeWriteTopics(write.statements)),
    ).toStrictEqual(["message_usersToRooms:*"]);
  });

  // The sidebar names the viewer's membership of each room it lists by that room, so a member joining or leaving it wakes the
  // Sidebar through the room's scope topic, and a participant's name is one of its display names, so a rename wakes it too
  test("a member joining a shared direct message wakes the sidebar through the room it lists", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { directMessageId, reader } = await createSharedDirectMessage(context);
    const newcomer = await createMockAuthSession(context.db);
    const read = await recordSidebarRead(context, reader);
    const write = recordStatements(context.db);

    await write.database
      .insert(usersToRoomsInMessage)
      .values({ notificationType: NotificationType.DirectMessage, roomId: directMessageId, userId: newcomer.user.id });

    expect(
      getWokenTopics(await computeReadTopics(read.statements), await computeWriteTopics(write.statements)),
    ).toStrictEqual([`${getTableName(usersToRoomsInMessage)}:roomId=${directMessageId}`]);
  });

  test("a member leaving a shared direct message wakes the sidebar through the room it lists", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { directMessageId, joiner, reader } = await createSharedDirectMessage(context);
    const read = await recordSidebarRead(context, reader);
    const write = recordStatements(context.db);

    await write.database
      .delete(usersToRoomsInMessage)
      .where(and(eq(usersToRoomsInMessage.roomId, directMessageId), eq(usersToRoomsInMessage.userId, joiner.user.id)));

    expect(
      getWokenTopics(await computeReadTopics(read.statements), await computeWriteTopics(write.statements)),
    ).toStrictEqual([`${getTableName(usersToRoomsInMessage)}:roomId=${directMessageId}`]);
  });

  // The sidebar reads a membership's display name and its visibility, not its last read time, so another member's last-read
  // Update names a column no sidebar read holds, and wakes no sidebar through the room's topic
  test("another member's last-read update wakes no sidebar that lists the room", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { directMessageId, joiner, reader } = await createSharedDirectMessage(context);
    const read = await recordSidebarRead(context, reader);
    const write = recordStatements(context.db);

    await write.database
      .update(usersToRoomsInMessage)
      .set({ lastReadAt: new Date() })
      .where(and(eq(usersToRoomsInMessage.roomId, directMessageId), eq(usersToRoomsInMessage.userId, joiner.user.id)));

    expect(
      getWokenTopics(await computeReadTopics(read.statements), await computeWriteTopics(write.statements)),
    ).toStrictEqual([]);
  });

  // The sidebar shows each participant by the display name the membership holds, so another member renaming it wakes the
  // Sidebar through the room's topic that names the membership
  test("another member's display-name update wakes the sidebar through the room it lists", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { directMessageId, joiner, reader } = await createSharedDirectMessage(context);
    const read = await recordSidebarRead(context, reader);
    const write = recordStatements(context.db);

    await write.database
      .update(usersToRoomsInMessage)
      .set({ displayName: "renamed" })
      .where(and(eq(usersToRoomsInMessage.roomId, directMessageId), eq(usersToRoomsInMessage.userId, joiner.user.id)));

    expect(
      getWokenTopics(await computeReadTopics(read.statements), await computeWriteTopics(write.statements)),
    ).toStrictEqual([`${getTableName(usersToRoomsInMessage)}:roomId=${directMessageId}`]);
  });

  test("a participant's rename wakes the sidebar through the name column its display name reads", async () => {
    expect.hasAssertions();

    const context = await createMockContext();
    const { joiner, reader } = await createSharedDirectMessage(context);
    const read = await recordSidebarRead(context, reader);
    const write = recordStatements(context.db);

    await write.database.update(usersInAuth).set({ name: "renamed" }).where(eq(usersInAuth.id, joiner.user.id));

    expect(
      getWokenTopics(await computeReadTopics(read.statements), await computeWriteTopics(write.statements)),
    ).toContain(`${getTableName(usersInAuth)}:*`);
  });
});
