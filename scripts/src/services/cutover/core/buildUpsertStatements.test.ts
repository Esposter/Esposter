import type { CoreTable } from "#src/models/cutover/CoreTable";

import { buildUpsertStatements } from "#src/services/cutover/core/buildUpsertStatements";
import { describe, expect, test } from "vitest";

describe(buildUpsertStatements, () => {
  const table: CoreTable = {
    columns: [
      { dataType: "string", name: "id", notNull: true },
      { dataType: "string", name: "name", notNull: true },
    ],
    foreignTableNames: [],
    name: "message_rooms",
    pgSchema: "message",
    pgTable: "rooms",
    primaryKeyColumns: [{ dataType: "string", name: "id", notNull: true }],
    timestampUniqueColumnGroups: [],
  };

  test("keeps each statement under the bound parameter limit and binds every value", () => {
    expect.hasAssertions();

    const rows = Array.from({ length: 120 }, (_, index) => [`id-${index}`, `name-${index}`]);
    const statements = buildUpsertStatements(table, rows);

    expect(statements.map(({ params }) => params.length)).toStrictEqual([100, 100, 40]);
    expect(statements[0]?.sql).toContain('ON CONFLICT ("id") DO UPDATE SET "name" = excluded."name"');
  });

  test("never splices a value into the SQL text", () => {
    expect.hasAssertions();

    const [statement] = buildUpsertStatements(table, [["x'); DROP TABLE users; --", "name"]]);

    expect(statement?.sql).not.toContain("DROP");
    expect(statement?.params).toStrictEqual(["x'); DROP TABLE users; --", "name"]);
  });
});
