import { getStatementReadSet } from "#src/services/realtime/getStatementReadSet";
import { recordStatements } from "#src/services/realtime/recordStatements";
import { createMockDb } from "@esposter/db-mock";
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
          left: { column: "roomId", occurrence: "d0", selectedAs: "roomId", table: "message_usersToRooms" },
          right: { column: "id", occurrence: "d1", table: "message_rooms" },
        },
      ],
    ]);
  });
});
