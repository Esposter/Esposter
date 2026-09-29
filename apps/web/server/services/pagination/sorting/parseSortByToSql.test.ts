import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { resourceAccessesInResource, resourcesInResource, usersInAuth } from "@esposter/db-schema";
import { asc, desc, getColumns } from "drizzle-orm";
import { describe, expect, test } from "vitest";

describe(parseSortByToSql, () => {
  test.each([
    [SortOrder.Asc, asc(usersInAuth.id)],
    [SortOrder.Desc, desc(usersInAuth.id)],
  ] as const)("orders %s", (order, expected) => {
    expect.hasAssertions();

    expect(parseSortByToSql(usersInAuth, [{ key: "id", order }])).toStrictEqual([expected]);
  });

  // The resource list sorts by a column that lives on the joined access row rather than on `resources`, so it
  // Passes the selection it built rather than a table — the path a table-only implementation would drop
  test("selection spanning a join", () => {
    expect.hasAssertions();

    const selection = { ...getColumns(resourcesInResource), lastAccessedAt: resourceAccessesInResource.accessedAt };

    expect(parseSortByToSql(selection, [{ key: "lastAccessedAt", order: SortOrder.Desc }])).toStrictEqual([
      desc(resourceAccessesInResource.accessedAt),
    ]);
  });
});
