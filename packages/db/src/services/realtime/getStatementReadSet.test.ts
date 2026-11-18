import { getStatementReadSet } from "#src/services/realtime/getStatementReadSet";
import { recordStatements } from "#src/services/realtime/recordStatements";
import { createMockDb } from "@esposter/db-mock";
import { roomsInMessage, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, inArray, sql } from "drizzle-orm";
import { describe, expect, test } from "vitest";

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
});
