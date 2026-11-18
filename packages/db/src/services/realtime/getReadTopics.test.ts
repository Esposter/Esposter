import type { Database } from "@esposter/db-schema";

import { getReadTopics } from "#src/services/realtime/getReadTopics";
import { recordStatements } from "#src/services/realtime/recordStatements";
import { createMockDb } from "@esposter/db-mock";
import {
  bookmarksInApp,
  invitesInMessage,
  resourcesInResource,
  roomsInMessage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { SECRET_TOKEN_LENGTH } from "@esposter/shared";
import { eq, inArray } from "drizzle-orm";
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
});
