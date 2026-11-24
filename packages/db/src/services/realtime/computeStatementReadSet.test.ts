import type { Database } from "@esposter/db-schema";
import type { SQL, SQLWrapper } from "drizzle-orm";

import { computeStatementReadSet } from "#src/services/realtime/computeStatementReadSet";
import { recordStatements } from "#src/services/realtime/recordStatements";
import { inJsonArray } from "#src/services/shared/inJsonArray";
import { notInJsonArray } from "#src/services/shared/notInJsonArray";
import { createMockDb } from "@esposter/db-mock";
import {
  invitesInMessage,
  MAX_READ_TOPICS,
  roomsInMessage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { and, eq, getTableName, inArray, not, or, sql } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

const inArrayList = (column: SQLWrapper, values: string[]) => inArray(column, values);

describe(computeStatementReadSet, () => {
  // A config of only `false`s is drizzle's exclusion mode: every column it does not name is selected, so a join side on
  // One of them keeps the key it is selected under
  test("names a join side on a column an exclusion-mode config still selects", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const { database, statements } = recordStatements(db);

    await database.query.usersToRoomsInMessage.findFirst({ columns: { displayName: false }, with: { room: true } });

    expect(statements.map(({ statement }) => computeStatementReadSet(statement).joins)).toStrictEqual([
      [
        {
          kind: "inner",
          left: {
            column: "roomId",
            level: 0,
            occurrence: "d0",
            selectedAs: "roomId",
            table: getTableName(usersToRoomsInMessage),
          },
          right: { column: "id", level: 0, occurrence: "d1", table: getTableName(roomsInMessage) },
        },
      ],
    ]);
  });

  // A level a statement opens with nothing in it still has its number: an occurrence's level is its position in
  // `levels`, so the level an occurrence is read in is found there even when an empty level comes before it. The
  // Statement is built, not run, since the walk reads the builder
  test("an occurrence's level is its position in the levels, after an empty level", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const readSet = computeStatementReadSet(
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

  // An IN list over a scope column is a scope per value, but a JSON array list was read as a filter, so its table was
  // Read whole and a write to any row of it woke the read. The list is read as the IN list it stands for
  test("a JSON array list on a scope column names a scope per value, as an IN list does", async () => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const firstRoomId = v7();
    const secondRoomId = v7();
    const { filters, scopes } = computeStatementReadSet(
      db
        .select()
        .from(usersToRoomsInMessage)
        .where(inJsonArray(usersToRoomsInMessage.roomId, [firstRoomId, secondRoomId])),
    );

    expect(scopes).toStrictEqual([
      { column: "roomId", table: getTableName(usersToRoomsInMessage), value: firstRoomId },
      { column: "roomId", table: getTableName(usersToRoomsInMessage), value: secondRoomId },
    ]);
    expect(filters).toStrictEqual([]);
  });

  // Wherever a condition sits, a JSON array list is read as the IN list over the same values: a scope where the IN list
  // Is one, A filter where it is not. The IN list's own read set is pinned by the suites that read it, so the two are
  // Compared here
  test.each<[string, (database: Database, inList: typeof inArrayList, values: string[]) => SQLWrapper]>([
    [
      "a secret scope column",
      (database, inList, values) => database.select().from(invitesInMessage).where(inList(invitesInMessage.id, values)),
    ],
    [
      "the null-filled side of a left join",
      (database, inList, values) =>
        database
          .select({ id: usersInAuth.id, roomId: usersToRoomsInMessage.roomId })
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

    expect(computeStatementReadSet(build(db, inJsonArray, values))).toStrictEqual(
      computeStatementReadSet(build(db, inArrayList, values)),
    );
  });

  // A list negated by `not` removes the rows it holds, so it filters its table, and `notInJsonArray` is that negation.
  // Neither names a value the read holds
  test.each<[string, (column: SQLWrapper, values: string[]) => SQL | undefined]>([
    ["notInJsonArray", notInJsonArray],
    ["not(inJsonArray)", (column, values) => not(inJsonArray(column, values))],
  ])("%s filters its table, and names no scope", async (_title, negate) => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const { filters, scopes } = computeStatementReadSet(
      db
        .select()
        .from(usersToRoomsInMessage)
        .where(negate(usersToRoomsInMessage.roomId, [v7(), v7()])),
    );

    expect(scopes).toStrictEqual([]);
    expect(filters).toStrictEqual([
      {
        column: "roomId",
        level: 0,
        occurrence: getTableName(usersToRoomsInMessage),
        site: "where",
        table: getTableName(usersToRoomsInMessage),
      },
    ]);
  });

  // A list longer than a header's budget still names a scope per value: the walker does not cut it short, since the
  // Budget collapses a read that names too many topics once every read's topics are merged
  test.each<[string, (column: SQLWrapper, values: string[]) => SQL]>([
    ["an IN list", inArrayList],
    ["a JSON array list", inJsonArray],
  ])("%s longer than the budget names a scope per value", async (_title, inList) => {
    expect.hasAssertions();

    const { db } = await createMockDb();
    const values = Array.from({ length: MAX_READ_TOPICS + 1 }, () => v7());
    const { filters, scopes } = computeStatementReadSet(
      db.select().from(usersToRoomsInMessage).where(inList(usersToRoomsInMessage.roomId, values)),
    );

    expect(scopes).toHaveLength(values.length);
    expect(filters).toStrictEqual([]);
  });
});
