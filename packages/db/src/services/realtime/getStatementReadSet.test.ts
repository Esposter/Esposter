import type { Database } from "@esposter/db-schema";
import type { SQL, SQLWrapper } from "drizzle-orm";

import { getStatementReadSet } from "#src/services/realtime/getStatementReadSet";
import { recordStatements } from "#src/services/realtime/recordStatements";
import { inJsonArray } from "#src/services/shared/inJsonArray";
import { notInJsonArray } from "#src/services/shared/notInJsonArray";
import { createMockDb } from "@esposter/db-mock";
import { invitesInMessage, roomsInMessage, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, inArray, not, or, sql } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

const inArrayList = (column: SQLWrapper, values: string[]) => inArray(column, values);
const inJsonArrayList = (column: SQLWrapper, values: string[]) => inJsonArray(column, values);

describe(getStatementReadSet, () => {
  // A config of only `false`s is drizzle's exclusion mode: every column it does not name is selected, so a join side on
  // One of them keeps the key it is selected under
  test("names a join side on a column an exclusion-mode config still selects", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const { database, statements } = recordStatements(db);

    await database.query.usersToRoomsInMessage.findFirst({ columns: { displayName: false }, with: { room: true } });

    expect(statements.map(({ statement }) => getStatementReadSet(statement).joins)).toStrictEqual([
      [
        {
          kind: "inner",
          left: { column: "roomId", level: 0, occurrence: "d0", selectedAs: "roomId", table: "message_usersToRooms" },
          right: { column: "id", level: 0, occurrence: "d1", table: "message_rooms" },
        },
      ],
    ]);
  });

  // A level a statement opens with nothing in it still has its number: an occurrence's level is its position in `levels`, so
  // The level an occurrence is read in is found there even when an empty level comes before it. The statement is built, not
  // Run, since the walk reads the builder
  test("an occurrence's level is its position in the levels, after an empty level", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const readSet = getStatementReadSet(
      db
        .select({ id: roomsInMessage.id })
        .from(roomsInMessage)
        .where(
          and(
            sql`(select 1) = 1`,
            inArray(roomsInMessage.id, db.select({ roomId: usersToRoomsInMessage.roomId }).from(usersToRoomsInMessage)),
          ),
        ),
    );
    for (const occurrence of readSet.occurrences)
      expect(readSet.levels[occurrence.level]?.tables).toContain(occurrence.table);
  });

  // An IN list over a scope column is a scope per value, but a JSON array list was read as a filter, so its table was read
  // Whole and a write to any row of it woke the read. The list is read as the IN list it stands for
  test("a JSON array list on a scope column names a scope per value, as an IN list does", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const firstRoomId = v7();
    const secondRoomId = v7();
    const { filters, scopes } = getStatementReadSet(
      db
        .select()
        .from(usersToRoomsInMessage)
        .where(inJsonArray(usersToRoomsInMessage.roomId, [firstRoomId, secondRoomId])),
    );

    expect(scopes).toStrictEqual([
      { column: "roomId", table: "message_usersToRooms", value: firstRoomId },
      { column: "roomId", table: "message_usersToRooms", value: secondRoomId },
    ]);
    expect(filters).toStrictEqual([]);
  });

  // Wherever a condition sits, a JSON array list is read as the IN list over the same values: a scope where the IN list is one,
  // A filter where it is not. The IN list's own read set is pinned by the suites that read it, so the two are compared here
  test.each<[string, (database: Database, inList: typeof inArrayList, values: string[]) => SQLWrapper]>([
    [
      "a secret scope column",
      (database, inList, values) => database.select().from(invitesInMessage).where(inList(invitesInMessage.id, values)),
    ],
    [
      "the null-filled side of a left join",
      (database, inList, values) =>
        database
          .select()
          .from(usersInAuth)
          .leftJoin(usersToRoomsInMessage, eq(usersToRoomsInMessage.userId, usersInAuth.id))
          .where(inList(usersToRoomsInMessage.roomId, values)),
    ],
    [
      "a branch of an or",
      (database, inList, values) =>
        database
          .select()
          .from(usersToRoomsInMessage)
          .where(or(inList(usersToRoomsInMessage.roomId, values), eq(usersToRoomsInMessage.isHidden, false))),
    ],
  ])("a JSON array list on %s is read as the IN list over its values", async (_title, build) => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const values = [v7(), v7()];

    expect(getStatementReadSet(build(db, inJsonArrayList, values))).toStrictEqual(
      getStatementReadSet(build(db, inArrayList, values)),
    );
  });

  // A list negated by `not` removes the rows it holds, so it filters its table, and `notInJsonArray` is that negation. Neither
  // Names a value the read holds
  test.each<[string, (column: SQLWrapper, values: string[]) => SQL | undefined]>([
    ["notInJsonArray", (column, values) => notInJsonArray(column, values)],
    ["not(inJsonArray)", (column, values) => not(inJsonArray(column, values))],
  ])("%s filters its table, and names no scope", async (_title, negate) => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const { filters, scopes } = getStatementReadSet(
      db
        .select()
        .from(usersToRoomsInMessage)
        .where(negate(usersToRoomsInMessage.roomId, [v7(), v7()])),
    );

    expect(scopes).toStrictEqual([]);
    expect(filters).toStrictEqual([
      { column: "roomId", level: 0, occurrence: "message_usersToRooms", site: "where", table: "message_usersToRooms" },
    ]);
  });
});
