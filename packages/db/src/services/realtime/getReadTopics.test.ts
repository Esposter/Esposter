import type { RecordedStatement } from "#src/models/realtime/RecordedStatement";
import type { Database } from "@esposter/db-schema";

import { getReadTopics } from "#src/services/realtime/getReadTopics";
import { getWokenTopics } from "#src/services/realtime/getWokenTopics";
import { getWriteTopics } from "#src/services/realtime/getWriteTopics";
import { recordStatements } from "#src/services/realtime/recordStatements";
import { createMockDb } from "@esposter/db-mock";
import {
  bookmarksInApp,
  invitesInMessage,
  resourcesInResource,
  roomEmojisInMessage,
  roomsInMessage,
  RoomType,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { SECRET_TOKEN_LENGTH } from "@esposter/shared";
import { and, eq, getTableName, inArray, isNull, ne, not, or, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
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

// A viewer alone in one room and sharing another with a second user, the shape the self-join tests read
const seedSelfJoinRooms = async () => {
  const { db } = await createMockDb();
  const viewerId = v7();
  const otherUserId = v7();
  await insertUser(db, viewerId);
  await insertUser(db, otherUserId);
  const aloneRoomId = v7();
  const sharedRoomId = v7();
  await db.insert(roomsInMessage).values([
    { id: aloneRoomId, name: aloneRoomId, type: RoomType.Room, userId: viewerId },
    { id: sharedRoomId, name: sharedRoomId, type: RoomType.Room, userId: viewerId },
  ]);
  await db.insert(usersToRoomsInMessage).values([
    { roomId: aloneRoomId, userId: viewerId },
    { roomId: sharedRoomId, userId: viewerId },
    { roomId: sharedRoomId, userId: otherUserId },
  ]);
  return { aloneRoomId, db, sharedRoomId, viewerId };
};

// The topics a read and a write both name, which the write wakes through the columns it changes and the read reads
const getWoken = async (read: RecordedStatement[], write: RecordedStatement[]) =>
  getWokenTopics(await getReadTopics(read), await getWriteTopics(write));

// The names of the topics a read watches, for a golden that records which topics a read names
const getReadTopicNames = async (statements: RecordedStatement[]) =>
  (await getReadTopics(statements)).map(({ topic }) => topic);

const seedUserRoom = async () => {
  const { db } = await createMockDb();
  const userId = v7();
  const roomId = v7();
  await insertUser(db, userId);
  await db.insert(roomsInMessage).values({ id: roomId, name: "room", type: RoomType.Room, userId });
  await db.insert(usersToRoomsInMessage).values({ roomId, userId });
  return { db, roomId, userId };
};

describe(getReadTopics, () => {
  // A scope equality names the rows its value selects, and a secret's value is named by its digest, not the secret. The
  // Table the read starts from is named by that equality alone
  test("a scope equality names the rows its value selects, and a secret by its digest", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const { database, statements } = recordStatements(db);

    await database
      .select()
      .from(invitesInMessage)
      .where(eq(invitesInMessage.id, "a".repeat(SECRET_TOKEN_LENGTH)));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(["message_invites:id=sha256:66d34fba71f8"]);
  });

  // A literal list on a scope column names each value it lists, as an equality names its one value
  test("a literal IN list on a scope column names each value it lists, as an equality does", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const firstRoomId = v7();
    const secondRoomId = v7();
    const { database, statements } = recordStatements(db);

    await database
      .select()
      .from(usersToRoomsInMessage)
      .where(inArray(usersToRoomsInMessage.roomId, [firstRoomId, secondRoomId]));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      [`message_usersToRooms:roomId=${firstRoomId}`, `message_usersToRooms:roomId=${secondRoomId}`].toSorted(),
    );
  });

  // A table a read joins is named table-wide, whatever the read selects of it. The join's rows would be a narrower name,
  // But a row a WHERE clause removes from the join is not among them, and a change that restores that row would not
  // Reach the read. The bookmark dock's resources are the case: a resource in the recycle bin leaves its bookmark out
  test("a table a read joins is named table-wide, whichever of its join keys the read selects", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    await insertUser(db, userId);
    const { database, statements } = recordStatements(db);

    await database
      .select({ path: bookmarksInApp.path, resourceId: bookmarksInApp.resourceId })
      .from(bookmarksInApp)
      .leftJoin(resourcesInResource, eq(resourcesInResource.id, bookmarksInApp.resourceId))
      .where(eq(bookmarksInApp.userId, userId));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual([
      `app_bookmarks:userId=${userId}`,
      "resource_resources:*",
    ]);
  });

  // A subquery's equality names the rows of its own table that it selects, and no more. The read it sits in still depends
  // On every membership of the table it selects from, where no equality of its own names the table, so the table is named
  // Table-wide there as well as by the subquery's equality
  test("a table a read selects from is named table-wide when only a subquery of it names a scope equality", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    const { database, statements } = recordStatements(db);

    await database
      .select()
      .from(usersToRoomsInMessage)
      .where(
        inArray(
          usersToRoomsInMessage.roomId,
          database
            .select({ roomId: usersToRoomsInMessage.roomId })
            .from(usersToRoomsInMessage)
            .where(eq(usersToRoomsInMessage.userId, userId)),
        ),
      );

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual([
      "message_usersToRooms:*",
      `message_usersToRooms:userId=${userId}`,
    ]);
  });

  // A read that filters a derived table's column narrows the derived table's rows, which the subquery's own level names,
  // But the read's own reference to the same table is still read whole, so the filter does not name that table here
  test("a filter on a derived table's column does not name the outer read's own reference to the same table", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    const roomId = v7();
    const { database, statements } = recordStatements(db);
    const memberships = database
      .select({ roomId: usersToRoomsInMessage.roomId })
      .from(usersToRoomsInMessage)
      .where(eq(usersToRoomsInMessage.userId, userId))
      .as("d0");

    await database
      .select({ userId: usersToRoomsInMessage.userId })
      .from(usersToRoomsInMessage)
      .innerJoin(memberships, eq(memberships.roomId, usersToRoomsInMessage.roomId))
      .where(eq(memberships.roomId, roomId));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      [
        "message_usersToRooms:*",
        `message_usersToRooms:roomId=${roomId}`,
        `message_usersToRooms:userId=${userId}`,
      ].toSorted(),
    );
  });

  // The table a read starts from has no equality here, so the read depends on all of its rows
  test("the table a read starts from is named table-wide when no scope equality names it", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const { database, statements } = recordStatements(db);

    await database.select().from(roomsInMessage);

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(["message_rooms:*"]);
  });

  // A table a read joins on a scope column is named by the values its join key takes in the rows the read returns, when the
  // Read selects that key. A row of another value is not in the read, so a write to it does not wake the read
  test("a table a read joins is named by the join key values its rows return", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    await insertUser(db, userId);
    const firstRoomId = v7();
    const secondRoomId = v7();
    await db.insert(roomsInMessage).values([
      { id: firstRoomId, name: firstRoomId, type: RoomType.Room, userId },
      { id: secondRoomId, name: secondRoomId, type: RoomType.Room, userId },
    ]);
    const { database, statements } = recordStatements(db);

    await database
      .select({ id: roomsInMessage.id })
      .from(roomsInMessage)
      .leftJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      [
        "message_rooms:*",
        `message_usersToRooms:roomId=${firstRoomId}`,
        `message_usersToRooms:roomId=${secondRoomId}`,
      ].toSorted(),
    );
  });

  // A table a read tests for null stays table-wide even when its join key is returned. A write that clears the null brings
  // A row back into the read, and that row's key is one no returned row carries, so only the table's own topic reaches it
  test("a table a read tests for null is named table-wide even when its join key is returned", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    await insertUser(db, userId);
    const roomId = v7();
    await db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
    const { database, statements } = recordStatements(db);

    await database
      .select({ id: roomsInMessage.id })
      .from(roomsInMessage)
      .leftJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id))
      .where(isNull(usersToRoomsInMessage.lastReadAt));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(["message_rooms:*", "message_usersToRooms:*"]);
  });

  // A left join keeps the partner's rows whatever its joined table's own condition in the ON clause removes, so the condition
  // Does not stop the joined table being named by the join key values the rows return. The viewer's own membership is left
  // Out of the join by its condition, yet its room is still returned, and each returned room names its memberships
  test("a table a left join's ON clause filters is named by the join key values its rows return", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    await insertUser(db, userId);
    const firstRoomId = v7();
    const secondRoomId = v7();
    await db.insert(roomsInMessage).values([
      { id: firstRoomId, name: firstRoomId, type: RoomType.Room, userId },
      { id: secondRoomId, name: secondRoomId, type: RoomType.Room, userId },
    ]);
    await db.insert(usersToRoomsInMessage).values({ roomId: firstRoomId, userId });
    const { database, statements } = recordStatements(db);

    await database
      .select({ id: roomsInMessage.id })
      .from(roomsInMessage)
      .leftJoin(
        usersToRoomsInMessage,
        and(eq(usersToRoomsInMessage.roomId, roomsInMessage.id), ne(usersToRoomsInMessage.userId, userId)),
      )
      .where(eq(roomsInMessage.userId, userId));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      [
        "message_rooms:*",
        `message_usersToRooms:roomId=${firstRoomId}`,
        `message_usersToRooms:roomId=${secondRoomId}`,
      ].toSorted(),
    );
  });

  // A left join on an aliased table is read as the join it is. The alias is written as the joined table itself, not as a name,
  // So the join's kind and its relation are read from that table, as they are for an unaliased one
  test("a table a left join reaches under an alias is named by the join key values its rows return", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    await insertUser(db, userId);
    const roomId = v7();
    await db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
    await db.insert(usersToRoomsInMessage).values({ roomId, userId });
    const { database, statements } = recordStatements(db);
    const memberships = alias(usersToRoomsInMessage, "roomMemberships");

    await database
      .select({ id: roomsInMessage.id })
      .from(roomsInMessage)
      .leftJoin(memberships, eq(memberships.roomId, roomsInMessage.id))
      .where(eq(roomsInMessage.userId, userId));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      ["message_rooms:*", `message_usersToRooms:roomId=${roomId}`].toSorted(),
    );
  });

  // A join's condition compares the joined table's key on either side, and the other join's condition that compares it on its
  // Right side is no filter of the table. The memberships are named by their room, though a second left join reads them too
  test("a table another left join compares its key against on the right is named by the join key values its rows return", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    await insertUser(db, userId);
    const firstRoomId = v7();
    const secondRoomId = v7();
    await db.insert(roomsInMessage).values([
      { id: firstRoomId, name: firstRoomId, type: RoomType.Room, userId },
      { id: secondRoomId, name: secondRoomId, type: RoomType.Room, userId },
    ]);
    const { database, statements } = recordStatements(db);

    await database
      .select({ id: roomsInMessage.id })
      .from(roomsInMessage)
      .leftJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id))
      .leftJoin(usersInAuth, eq(usersInAuth.id, usersToRoomsInMessage.userId))
      .where(eq(roomsInMessage.userId, userId));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      [
        "auth_users:*",
        "message_rooms:*",
        `message_usersToRooms:roomId=${firstRoomId}`,
        `message_usersToRooms:roomId=${secondRoomId}`,
      ].toSorted(),
    );
  });

  // A filter names an occurrence of a table, not the table, so it does not stop another occurrence of that table being named by
  // Its join key values. The viewer's own membership is filtered by `isHidden`, and the other memberships of each room are read
  // Through a subquery, which names them by the room the outer rows return
  test("a filter on one occurrence of a table does not stop another occurrence of it being named by its join key values", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    const otherUserId = v7();
    await insertUser(db, userId);
    await insertUser(db, otherUserId);
    const roomId = v7();
    await db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
    await db.insert(usersToRoomsInMessage).values([
      { isHidden: false, roomId, userId },
      { isHidden: false, roomId, userId: otherUserId },
    ]);
    const { database, statements } = recordStatements(db);
    const participantMemberships = alias(usersToRoomsInMessage, "participantMemberships");
    const participants = database
      .select({ roomId: participantMemberships.roomId })
      .from(roomsInMessage)
      .leftJoin(
        participantMemberships,
        and(eq(participantMemberships.roomId, roomsInMessage.id), ne(participantMemberships.userId, userId)),
      )
      .groupBy(participantMemberships.roomId)
      .as("participants");

    await database
      .select({ id: roomsInMessage.id })
      .from(roomsInMessage)
      .innerJoin(
        usersToRoomsInMessage,
        and(
          eq(usersToRoomsInMessage.roomId, roomsInMessage.id),
          eq(usersToRoomsInMessage.userId, userId),
          eq(usersToRoomsInMessage.isHidden, false),
        ),
      )
      .leftJoin(participants, eq(participants.roomId, roomsInMessage.id))
      .where(eq(roomsInMessage.userId, userId));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      ["message_rooms:*", `message_usersToRooms:roomId=${roomId}`, `message_usersToRooms:userId=${userId}`].toSorted(),
    );
  });

  // An inner join whose condition references a table occurrence drops the rows of that occurrence that no match reaches. A left
  // Join names the occurrence by the rows that do not reach it, so the inner join makes the occurrence table-wide
  test("a table an inner join after a left join references is named table-wide, though the left join names it", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    await insertUser(db, userId);
    const roomId = v7();
    await db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
    await db.insert(usersToRoomsInMessage).values({ roomId, userId });
    const { database, statements } = recordStatements(db);

    await database
      .select({ id: roomsInMessage.id })
      .from(roomsInMessage)
      .leftJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id))
      .innerJoin(usersInAuth, eq(usersInAuth.id, usersToRoomsInMessage.userId))
      .where(eq(roomsInMessage.userId, userId));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      ["auth_users:*", "message_rooms:*", "message_usersToRooms:*"].toSorted(),
    );
  });

  // An inner join whose condition references only other occurrences drops no row of the table a left join names, so the table
  // Is still named by the rows that join returns
  test("a table a left join names stays named by its rows when an inner join references only other occurrences", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    await insertUser(db, userId);
    const roomId = v7();
    await db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
    const { database, statements } = recordStatements(db);

    await database
      .select({ id: roomsInMessage.id })
      .from(roomsInMessage)
      .leftJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id))
      .innerJoin(usersInAuth, eq(usersInAuth.id, roomsInMessage.userId))
      .where(eq(roomsInMessage.userId, userId));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      ["auth_users:*", "message_rooms:*", `message_usersToRooms:roomId=${roomId}`].toSorted(),
    );
  });

  // A table is named by its rows only where each occurrence of it is. A second occurrence of the same table that a left join
  // Names by no value the read selects is unnamed, so the table stays table-wide, though the first occurrence is row-named
  test("a table with one row-named occurrence and one unnamed occurrence keeps its table-wide topic", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    await insertUser(db, userId);
    const roomId = v7();
    await db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
    await db.insert(usersToRoomsInMessage).values({ roomId, userId });
    const participants = alias(usersToRoomsInMessage, "participants");
    const { database, statements } = recordStatements(db);

    await database
      .select({ id: roomsInMessage.id })
      .from(roomsInMessage)
      .leftJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id))
      .leftJoin(participants, eq(participants.roomId, usersToRoomsInMessage.roomId))
      .where(eq(roomsInMessage.userId, userId));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      ["message_rooms:*", "message_usersToRooms:*"].toSorted(),
    );
  });

  // The equality is on the table a left join keeps, so the join returns that table's rows of every value, and a write of another
  // Value brings a row no scope topic reaches. The table is read whole, not by the scope the ON clause tests
  test("an equality on the preserved side of a left join's ON clause names no scope", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    await insertUser(db, userId);
    const roomId = v7();
    await db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
    await db.insert(usersToRoomsInMessage).values({ roomId, userId });
    const { database, statements } = recordStatements(db);

    await database
      .select({ roomId: usersToRoomsInMessage.roomId })
      .from(usersToRoomsInMessage)
      .leftJoin(
        roomsInMessage,
        and(eq(roomsInMessage.id, usersToRoomsInMessage.roomId), eq(usersToRoomsInMessage.userId, userId)),
      );

    const topics = await getReadTopicNames(statements);
    expect(topics).toContain("message_usersToRooms:*");
    expect(topics.some((topic) => topic.startsWith("message_usersToRooms:userId="))).toBe(false);
  });

  // A negated equality removes the rows it holds, so the rows it leaves are every other value's, and no scope names them
  test("an equality under a not names no scope", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    const otherUserId = v7();
    await insertUser(db, userId);
    await insertUser(db, otherUserId);
    const roomId = v7();
    await db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
    await db.insert(usersToRoomsInMessage).values({ roomId, userId: otherUserId });
    const { database, statements } = recordStatements(db);

    await database
      .select({ roomId: usersToRoomsInMessage.roomId })
      .from(usersToRoomsInMessage)
      .where(not(eq(usersToRoomsInMessage.userId, userId)));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(["message_usersToRooms:*"]);
  });

  // An equality under an or names no scope: a row the other branch holds is not its value's, so the rows the read returns are
  // Not all of the scope's, and the table is named table-wide
  test("an equality under an or names no scope, whichever branch the other one is", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    const { database, statements } = recordStatements(db);

    await database
      .select({ roomId: usersToRoomsInMessage.roomId })
      .from(usersToRoomsInMessage)
      .where(or(eq(usersToRoomsInMessage.userId, userId), eq(usersToRoomsInMessage.displayName, "a")));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(["message_usersToRooms:*"]);
  });

  // A column a read selects or groups by removes no row, so selecting the joined table's key does not filter it. The table
  // Is still named by the join key values its rows return, which is the room each returned membership belongs to
  test("a column a read selects from a left-joined table does not filter it out of the join's rows", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    await insertUser(db, userId);
    const roomId = v7();
    await db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
    await db.insert(usersToRoomsInMessage).values({ roomId, userId });
    const { database, statements } = recordStatements(db);

    await database
      .select({ id: roomsInMessage.id, membershipRoomId: usersToRoomsInMessage.roomId })
      .from(roomsInMessage)
      .leftJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id))
      .where(eq(roomsInMessage.userId, userId))
      .groupBy(usersToRoomsInMessage.roomId, roomsInMessage.id);

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      ["message_rooms:*", `message_usersToRooms:roomId=${roomId}`].toSorted(),
    );
  });

  // A condition on the table a left join brings, in its WHERE clause, removes the rows the join keeps, which turns the join
  // Inner. A write that makes a removed row pass brings back a row no returned row carries, so the table is read whole
  test("a table a left join's WHERE clause filters is named table-wide", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    await insertUser(db, userId);
    const roomId = v7();
    await db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
    const { database, statements } = recordStatements(db);

    await database
      .select({ id: roomsInMessage.id })
      .from(roomsInMessage)
      .leftJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.roomId, roomsInMessage.id))
      .where(ne(usersToRoomsInMessage.userId, userId));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(["message_rooms:*", "message_usersToRooms:*"]);
  });

  // An `in` over the table itself keeps the rows its subquery names, since each of the subquery's values is held by a row the
  // Read returns. So each returned row names the value it holds, and the subquery's own equality names the viewer's rows
  test("a table an in over itself tests is named by each value its subquery's rows hold", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    const otherUserId = v7();
    await insertUser(db, userId);
    await insertUser(db, otherUserId);
    const firstRoomId = v7();
    const secondRoomId = v7();
    await db.insert(roomsInMessage).values([
      { id: firstRoomId, name: firstRoomId, type: RoomType.Room, userId },
      { id: secondRoomId, name: secondRoomId, type: RoomType.Room, userId },
    ]);
    await db.insert(usersToRoomsInMessage).values([
      { roomId: firstRoomId, userId },
      { roomId: secondRoomId, userId },
      { roomId: firstRoomId, userId: otherUserId },
    ]);
    const { database, statements } = recordStatements(db);

    await database
      .select()
      .from(usersToRoomsInMessage)
      .where(
        inArray(
          usersToRoomsInMessage.roomId,
          database
            .select({ roomId: usersToRoomsInMessage.roomId })
            .from(usersToRoomsInMessage)
            .where(eq(usersToRoomsInMessage.userId, userId)),
        ),
      );

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      [
        `message_usersToRooms:roomId=${firstRoomId}`,
        `message_usersToRooms:roomId=${secondRoomId}`,
        `message_usersToRooms:userId=${userId}`,
      ].toSorted(),
    );
  });

  // A table an `in` over another table tests stays table-wide, though its returned rows carry the column. A room the viewer is
  // In may hold no emoji yet, and the first emoji it gets carries a value no returned row names, so the outer table is read whole
  test("a table an in over another table tests stays table-wide, though its returned rows carry the column", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const userId = v7();
    await insertUser(db, userId);
    const roomId = v7();
    await db.insert(roomsInMessage).values({ id: roomId, name: roomId, type: RoomType.Room, userId });
    await db.insert(usersToRoomsInMessage).values({ roomId, userId });
    await db.insert(roomEmojisInMessage).values({ name: "emoji", roomId });
    const { database, statements } = recordStatements(db);

    await database
      .select({ roomId: roomEmojisInMessage.roomId })
      .from(roomEmojisInMessage)
      .where(
        inArray(
          roomEmojisInMessage.roomId,
          database
            .select({ roomId: usersToRoomsInMessage.roomId })
            .from(usersToRoomsInMessage)
            .where(eq(usersToRoomsInMessage.userId, userId)),
        ),
      );

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      ["message_roomEmojis:*", `message_usersToRooms:userId=${userId}`].toSorted(),
    );
  });

  // A self-join's partner is named by the partner key the read selects for it. Here the select returns only the partner's own
  // Room, which is the named side's value, not the viewer's: a room the viewer is alone in has no partner, so its partner row
  // Carries a null room and names nothing. The partner's table is then read whole, since no returned row names the rows a new
  // Partner would bring
  test("a self-join's partner is named table-wide when the select returns only the partner's own room", async () => {
    expect.hasAssertions();

    const { db, viewerId } = await seedSelfJoinRooms();
    const { database, statements } = recordStatements(db);
    const partner = alias(usersToRoomsInMessage, "partner");

    await database
      .select({ roomId: partner.roomId })
      .from(usersToRoomsInMessage)
      .leftJoin(
        partner,
        and(eq(partner.roomId, usersToRoomsInMessage.roomId), ne(partner.userId, usersToRoomsInMessage.userId)),
      )
      .where(eq(usersToRoomsInMessage.userId, viewerId));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      ["message_usersToRooms:*", `message_usersToRooms:userId=${viewerId}`].toSorted(),
    );
  });

  // The same self-join, where the select also returns the viewer's own room under a name the partner's room does not take. The
  // Viewer's room is the partner's key, every viewer row returns it, and so the partner is named by each room the viewer holds
  test("a self-join's partner is named by the viewer's rooms when the select returns them too", async () => {
    expect.hasAssertions();

    const { aloneRoomId, db, sharedRoomId, viewerId } = await seedSelfJoinRooms();
    const { database, statements } = recordStatements(db);
    const partner = alias(usersToRoomsInMessage, "partner");

    await database
      .select({ partnerRoomId: partner.roomId, roomId: usersToRoomsInMessage.roomId })
      .from(usersToRoomsInMessage)
      .leftJoin(
        partner,
        and(eq(partner.roomId, usersToRoomsInMessage.roomId), ne(partner.userId, usersToRoomsInMessage.userId)),
      )
      .where(eq(usersToRoomsInMessage.userId, viewerId));

    await expect(getReadTopicNames(statements)).resolves.toStrictEqual(
      [
        `message_usersToRooms:roomId=${aloneRoomId}`,
        `message_usersToRooms:roomId=${sharedRoomId}`,
        `message_usersToRooms:userId=${viewerId}`,
      ].toSorted(),
    );
  });

  // A table-wide read names the table's rows, which an insert or a delete changes, and each column it reads, which an update
  // Of that column changes. An update names the columns it sets, not the rows, so a read of other columns is not woken by it
  const tableName = getTableName(usersToRoomsInMessage);

  test("an update to a column no table-wide read names wakes no one", async () => {
    expect.hasAssertions();

    const { db, roomId } = await seedUserRoom();
    const read = recordStatements(db);
    await read.database.select({ roomId: usersToRoomsInMessage.roomId }).from(usersToRoomsInMessage);
    const write = recordStatements(db);
    await write.database
      .update(usersToRoomsInMessage)
      .set({ lastReadAt: new Date() })
      .where(eq(usersToRoomsInMessage.roomId, roomId));

    await expect(getWoken(read.statements, write.statements)).resolves.toStrictEqual([]);
  });

  test("an update to a column a table-wide read names wakes it, through the table's topic", async () => {
    expect.hasAssertions();

    const { db, roomId } = await seedUserRoom();
    const read = recordStatements(db);
    await read.database
      .select({ roomId: usersToRoomsInMessage.roomId })
      .from(usersToRoomsInMessage)
      .where(eq(usersToRoomsInMessage.isHidden, false));
    const write = recordStatements(db);
    await write.database
      .update(usersToRoomsInMessage)
      .set({ isHidden: true })
      .where(eq(usersToRoomsInMessage.roomId, roomId));

    await expect(getWoken(read.statements, write.statements)).resolves.toStrictEqual([`${tableName}:*`]);
  });

  // The read references only roomId, so an update to isHidden changes no column it reads and wakes it through no topic
  test("an update to a column a table-wide read does not reference wakes it through no topic", async () => {
    expect.hasAssertions();

    const { db, roomId } = await seedUserRoom();
    const read = recordStatements(db);
    await read.database.select({ roomId: usersToRoomsInMessage.roomId }).from(usersToRoomsInMessage);
    const write = recordStatements(db);
    await write.database
      .update(usersToRoomsInMessage)
      .set({ isHidden: true })
      .where(eq(usersToRoomsInMessage.roomId, roomId));

    await expect(getWoken(read.statements, write.statements)).resolves.toStrictEqual([]);
  });

  // A table-wide read names the columns its statement references of the table, and no other, on its table's topic
  test("a table-wide read watches the columns its statement references, on its table's topic", async () => {
    expect.hasAssertions();

    const { db } = await seedUserRoom();
    const { database, statements } = recordStatements(db);
    await database
      .select({ roomId: usersToRoomsInMessage.roomId })
      .from(usersToRoomsInMessage)
      .where(eq(usersToRoomsInMessage.isHidden, false));

    await expect(getReadTopics(statements)).resolves.toStrictEqual([
      { columns: ["isHidden", "roomId"], topic: `${tableName}:*` },
    ]);
  });

  // A raw fragment names its columns in text the walker cannot read, so the read names every column of the table it sits in
  test("an update to a column a raw fragment names wakes a table-wide read that names it through the fragment", async () => {
    expect.hasAssertions();

    const { db, roomId } = await seedUserRoom();
    const read = recordStatements(db);
    await read.database
      .select({ roomId: usersToRoomsInMessage.roomId })
      .from(usersToRoomsInMessage)
      .where(sql`isHidden = 0`);
    const write = recordStatements(db);
    await write.database
      .update(usersToRoomsInMessage)
      .set({ isHidden: true })
      .where(eq(usersToRoomsInMessage.roomId, roomId));

    await expect(getWoken(read.statements, write.statements)).resolves.toContain(`${tableName}:*`);
  });

  test("an insert wakes a table-wide read through the table's row topic", async () => {
    expect.hasAssertions();

    const { db, userId } = await seedUserRoom();
    const otherRoomId = v7();
    await db.insert(roomsInMessage).values({ id: otherRoomId, name: "other", type: RoomType.Room, userId });
    const read = recordStatements(db);
    await read.database.select({ roomId: usersToRoomsInMessage.roomId }).from(usersToRoomsInMessage);
    const write = recordStatements(db);
    await write.database.insert(usersToRoomsInMessage).values({ roomId: otherRoomId, userId });

    await expect(getWoken(read.statements, write.statements)).resolves.toContain(`${tableName}:*`);
  });
});
