import { schema } from "#src/generated/schema";
import { getTableScope } from "#src/services/realtime/getTableScope";
import { getTableColumns, getTableName } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { describe, expect, test } from "vitest";

describe(getTableScope, () => {
  // A scope names the columns its topics are keyed by. A rename that leaves one behind would key topics by a column
  // That no longer exists, and every read of the table would stop refreshing without an error, so the check runs over
  // Every table
  test("every scope column is a column of its table", () => {
    expect.hasAssertions();

    const missing = Object.values(schema).flatMap((table) => {
      const scope = getTableScope(table);
      if (!scope) return [];
      const columnNames = Object.keys(getTableColumns(table));
      return [...scope.columns, ...(scope.secretColumns ?? [])]
        .filter((columnName) => !columnNames.includes(columnName))
        .map((columnName) => `${getTableName(table)}.${columnName}`);
    });

    expect(missing).toStrictEqual([]);
  });

  // A secret column is one of its scope's columns, so the columns list alone names the columns a read is scoped by, and
  // A secret that a read names is only ever scoped by a column the columns list holds
  test("every secret column is one of its scope's columns", () => {
    expect.hasAssertions();

    const unlisted = Object.values(schema).flatMap((table) => {
      const scope = getTableScope(table);
      return (scope?.secretColumns ?? [])
        .filter((columnName) => !scope?.columns.includes(columnName))
        .map((columnName) => `${getTableName(table)}.${columnName}`);
    });

    expect(unlisted).toStrictEqual([]);
  });

  // The invite's id is the bearer secret its link carries, so a topic over it would send that secret to every
  // Watcher. The scope marks it secret, and the topic it names is a digest
  test("the invite's id is a secret scope column", () => {
    expect.hasAssertions();

    expect(getTableScope(schema.invitesInMessage)?.secretColumns).toStrictEqual(["id"]);
  });

  // A relational query reads its tables through aliases, and the scope a read names must follow the table to its alias
  test("an alias of a table reads that table's scope", () => {
    expect.hasAssertions();

    expect(getTableScope(alias(schema.bookmarksInApp, "d0"))).toBe(getTableScope(schema.bookmarksInApp));
  });
});
