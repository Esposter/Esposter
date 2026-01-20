import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { parseSortByToSql } from "@@/server/services/pagination/sorting/parseSortByToSql";
import { users } from "@esposter/db-schema";
import { asc, desc } from "drizzle-orm";
import { describe, expect, test } from "vitest";

describe(parseSortByToSql, () => {
  test("empty array", () => {
    expect.hasAssertions();

    expect(parseSortByToSql(users, [])).toStrictEqual([]);
  });

  test(SortOrder.Asc, () => {
    expect.hasAssertions();

    expect(parseSortByToSql(users, [{ key: "id", order: SortOrder.Asc }])).toStrictEqual([asc(users.id)]);
  });

  test(SortOrder.Desc, () => {
    expect.hasAssertions();

    expect(parseSortByToSql(users, [{ key: "id", order: SortOrder.Desc }])).toStrictEqual([desc(users.id)]);
  });
});
