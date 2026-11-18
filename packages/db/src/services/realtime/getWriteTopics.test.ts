import type { Database } from "@esposter/db-schema";

import { getWriteTopics } from "#src/services/realtime/getWriteTopics";
import { recordStatements } from "#src/services/realtime/recordStatements";
import { createMockDb } from "@esposter/db-mock";
import {
  invitesInMessage,
  NotificationType,
  resourcesInResource,
  ResourceType,
  roomsInMessage,
  RoomType,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { SECRET_TOKEN_LENGTH } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

const insertUser = (db: Database, id: string) =>
  db
    .insert(usersInAuth)
    .values({
      createdAt: new Date(0),
      email: id,
      emailVerified: true,
      id,
      image: "",
      name: id,
      updatedAt: new Date(0),
    });

// A room and its owner, the rows a membership or an invite names
const insertRoom = async (db: Database, roomId: string, userId: string) => {
  await insertUser(db, userId);
  await db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
};

describe(getWriteTopics, () => {
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

    await expect(getWriteTopics(statements)).resolves.toStrictEqual([
      "message_usersToRooms:*",
      `message_usersToRooms:roomId=${roomId}`,
      `message_usersToRooms:userId=${userId}`,
    ]);
  });

  // An update names the values its rows hold after it, which is what a reader of the row now reads
  test("an update names the scope values of the rows it returns", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const userId = v7();
    await insertRoom(db, roomId, userId);
    await db.insert(usersToRoomsInMessage).values({ notificationType: NotificationType.DirectMessage, roomId, userId });
    const { database, statements } = recordStatements(db);

    await database
      .update(usersToRoomsInMessage)
      .set({ displayName: "renamed" })
      .where(eq(usersToRoomsInMessage.userId, userId))
      .returning();

    await expect(getWriteTopics(statements)).resolves.toStrictEqual([
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
    await db.insert(usersToRoomsInMessage).values({ notificationType: NotificationType.DirectMessage, roomId, userId });
    const { database, statements } = recordStatements(db);

    await database
      .insert(usersToRoomsInMessage)
      .values({ notificationType: NotificationType.Never, roomId, userId })
      .onConflictDoUpdate({
        set: { notificationType: NotificationType.Never },
        target: [usersToRoomsInMessage.userId, usersToRoomsInMessage.roomId],
      })
      .returning();

    await expect(getWriteTopics(statements)).resolves.toStrictEqual([
      "message_usersToRooms:*",
      `message_usersToRooms:roomId=${roomId}`,
      `message_usersToRooms:userId=${userId}`,
    ]);
  });

  // A resource delete changes its own row and every row its foreign keys cascade to, which RETURNING does not report, so
  // The thirteen child tables are named table-wide beside the resource's own topics. The three that reference the
  // Resource by a scope column are also named by its id, the value the child rows held
  test("a delete names the scope values of the rows it deletes and the tables its foreign keys cascade to", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const resourceId = v7();
    const userId = v7();
    await insertUser(db, userId);
    await db.insert(resourcesInResource).values({ id: resourceId, name: resourceId, type: ResourceType.Note, userId });
    const { database, statements } = recordStatements(db);

    await database.delete(resourcesInResource).where(eq(resourcesInResource.id, resourceId)).returning();

    await expect(getWriteTopics(statements)).resolves.toStrictEqual(
      [
        "resource_resources:*",
        `resource_resources:id=${resourceId}`,
        `resource_resources:userId=${userId}`,
        `app_bookmarks:resourceId=${resourceId}`,
        `resource_resourcePublications:resourceId=${resourceId}`,
        `resource_surveyResponses:resourceId=${resourceId}`,
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

    await expect(getWriteTopics(statements)).resolves.toStrictEqual([
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
    await db.insert(usersToRoomsInMessage).values({ notificationType: NotificationType.DirectMessage, roomId, userId });
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

    await expect(getWriteTopics(statements)).resolves.toStrictEqual(
      [
        "message_usersToRooms:*",
        `message_usersToRooms:roomId=${roomId}`,
        `message_usersToRooms:userId=${joinerId}`,
        `message_usersToRooms:userId=${userId}`,
      ].toSorted(),
    );
  });

  // A write that asks for no RETURNING reports no rows, so it cannot name the values it changed. It still names its
  // Table-wide topic, which every reader of the table watches, rather than publishing nothing
  test("a write that returns no rows names its table's topic alone", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const roomId = v7();
    const userId = v7();
    await insertRoom(db, roomId, userId);
    await db.insert(usersToRoomsInMessage).values({ notificationType: NotificationType.DirectMessage, roomId, userId });
    const { database, statements } = recordStatements(db);

    await database
      .update(usersToRoomsInMessage)
      .set({ displayName: "renamed" })
      .where(eq(usersToRoomsInMessage.userId, userId));

    await expect(getWriteTopics(statements)).resolves.toStrictEqual(["message_usersToRooms:*"]);
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

    await expect(getWriteTopics(statements)).resolves.toStrictEqual([]);
  });

  // A read changes nothing, so a query that awaits through the handle names no write topic
  test("a read names no write topic", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const { database, statements } = recordStatements(db);

    await database.select().from(roomsInMessage);

    await expect(getWriteTopics(statements)).resolves.toStrictEqual([]);
  });
});
