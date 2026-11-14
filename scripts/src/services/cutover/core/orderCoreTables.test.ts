import type { CoreTable } from "#src/models/cutover/CoreTable";

import { orderCoreTables } from "#src/services/cutover/core/orderCoreTables";
import { describe, expect, test } from "vitest";

describe(orderCoreTables, () => {
  const createTable = (name: string, foreignTableNames: string[] = []): CoreTable => ({
    columns: [],
    foreignTableNames,
    name,
    pgSchema: "schema",
    pgTable: name,
    primaryKeyColumns: [],
    timestampUniqueColumnGroups: [],
  });

  test("puts every parent before the tables that reference it", () => {
    expect.hasAssertions();

    const ordered = orderCoreTables([
      createTable("message_messages", ["message_rooms"]),
      createTable("message_rooms", ["auth_users"]),
      createTable("auth_users"),
    ]);

    expect(ordered.map(({ name }) => name)).toStrictEqual(["auth_users", "message_rooms", "message_messages"]);
  });

  test("refuses a cycle rather than picking an order that breaks a foreign key", () => {
    expect.hasAssertions();

    expect(() => orderCoreTables([createTable("a", ["b"]), createTable("b", ["a"])])).toThrowError(/cycle/u);
  });
});
