import type { Database, ScopeTopic } from "@esposter/db-schema";

import { createMockAuthSession, createMockContext, getMockSession } from "#server/trpc/context.test";
import { createCallerFactory } from "#server/trpc/index";
import { bookmarkRouter } from "#server/trpc/routers/bookmark";
import { friendRouter } from "#server/trpc/routers/friend";
import { inviteRouter } from "#server/trpc/routers/invite";
import { postRouter } from "#server/trpc/routers/post";
import { roomRouter } from "#server/trpc/routers/room/index";
import { getReadSet, getReadTopics, getSchemaTables, getWriteTopics, recordStatements } from "@esposter/db";
import {
  bookmarksInApp,
  NotificationType,
  resourcesInResource,
  ResourceType,
  roomsInMessage,
  RoomType,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { and, eq, getTableName } from "drizzle-orm";
import { SQLiteDialect } from "drizzle-orm/sqlite-core";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// The topics a read watches that a write publishes: the ones a write wakes the read through. A read whose topics do not
// Include one the write publishes is not woken by it
const getWokenTopics = (readTopics: ScopeTopic[], writeTopics: ScopeTopic[]) =>
  readTopics.filter((topic) => writeTopics.includes(topic));

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
          const readTableNames = new Set(getReadSet(statements).tables);
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

  // The dock reads a bookmarked resource through a join, which names the resource table table-wide, so renaming the resource
  // Wakes the dock through that table topic. Without the join the dock would name no resource topic and the rename would not reach it
  test("a rename of a bookmarked resource wakes the bookmark dock that joins it", async () => {
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
      .where(eq(resourcesInResource.id, resourceId))
      .returning();

    expect(getWokenTopics(await getReadTopics(read.statements), await getWriteTopics(write.statements))).toStrictEqual([
      "resource_resources:*",
    ]);
  });

  // The dock reads the viewer's own memberships of the rooms it bookmarks, so a change to the viewer's membership wakes it
  test("a change to the viewer's own room membership wakes the bookmark dock that reads it", async () => {
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
      .where(and(eq(usersToRoomsInMessage.roomId, roomId), eq(usersToRoomsInMessage.userId, userId)))
      .returning();

    expect(getWokenTopics(await getReadTopics(read.statements), await getWriteTopics(write.statements))).toStrictEqual([
      `message_usersToRooms:userId=${userId}`,
    ]);
  });

  // The landing page counts its room's members, which another member's join changes. The page reads the count through
  // Its room's memberships, so the join wakes it, which the page's own declaration never did
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
      .values({ notificationType: NotificationType.DirectMessage, roomId: room.id, userId: joiner.user.id })
      .returning();

    expect(getWokenTopics(await getReadTopics(read.statements), await getWriteTopics(write.statements))).toStrictEqual([
      `message_usersToRooms:roomId=${room.id}`,
    ]);
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
      .where(eq(resourcesInResource.id, binnedResourceId))
      .returning();

    expect(getWokenTopics(await getReadTopics(read.statements), await getWriteTopics(write.statements))).toStrictEqual([
      "resource_resources:*",
    ]);
  });

  // The sidebar lists the rooms the viewer is in, with each direct message's participants joined on the room. Another member
  // Joining a room the sidebar lists wakes it through that room's own value, not through the participants table as a whole
  test("another member joining a room the viewer lists wakes the sidebar through that room's value", async () => {
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
      .values({ notificationType: NotificationType.DirectMessage, roomId: room.id, userId: joiner.user.id })
      .returning();

    expect(getWokenTopics(await getReadTopics(read.statements), await getWriteTopics(write.statements))).toStrictEqual([
      `message_usersToRooms:roomId=${room.id}`,
    ]);
  });
});
