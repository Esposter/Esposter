import type { Database } from "@esposter/db-schema";

import { getReadTopics } from "#src/services/realtime/getReadTopics";
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
import { and, eq, inArray, isNull, ne } from "drizzle-orm";
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(["message_invites:id=sha256:66d34fba71f8"]);
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual([
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual([
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(["message_rooms:*"]);
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(["message_rooms:*", "message_usersToRooms:*"]);
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(
      ["auth_users:*", "message_rooms:*", `message_usersToRooms:roomId=${roomId}`].toSorted(),
    );
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(["message_rooms:*", "message_usersToRooms:*"]);
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(
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

    await expect(getReadTopics(statements)).resolves.toStrictEqual(
      ["message_roomEmojis:*", `message_usersToRooms:userId=${userId}`].toSorted(),
    );
  });
});
