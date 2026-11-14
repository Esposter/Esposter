import { BinaryOperator, StreamTable, createStreamTable } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";
import { SQLiteSyncDialect } from "drizzle-orm/sqlite-core";
import { compileClauses } from "#src/services/streams/compileClauses";

describe(compileClauses, () => {
  const table = createStreamTable(StreamTable.Messages);
  const dialect = new SQLiteSyncDialect();
  const getQuery = (clauses: Parameters<typeof compileClauses>[0]) => {
    const condition = compileClauses(clauses, table);
    if (!condition) throw new Error("expected a condition");
    return dialect.sqlToQuery(condition);
  };

  test("has no condition for no clauses", () => {
    expect.hasAssertions();

    expect(compileClauses([], table)).toBeUndefined();
  });

  test("binds a key column's value as a parameter", () => {
    expect.hasAssertions();

    expect(getQuery([{ key: "partitionKey", operator: BinaryOperator.Eq, value: "room" }])).toStrictEqual({
      params: ["room"],
      sql: `"Messages"."partitionKey" = ?`,
    });
  });

  test("reads any other property from the entity's JSON, a slash naming a nested member", () => {
    expect.hasAssertions();

    expect(getQuery([{ key: "a/b", operator: BinaryOperator.Eq, value: "x" }]).params).toStrictEqual(["$.a.b", "x"]);
  });

  test("tests a null with is null and is not null, and not negates the condition", () => {
    expect.hasAssertions();

    expect(getQuery([{ key: "deletedAt", operator: BinaryOperator.Eq, value: null }]).sql).toContain("is null");
    expect(getQuery([{ key: "deletedAt", operator: BinaryOperator.Ne, value: null }]).sql).toContain("is not null");
    expect(getQuery([{ key: "deletedAt", not: true, operator: BinaryOperator.Eq, value: null }]).sql).toMatch(
      /^not \(/u,
    );
  });

  test("compares a Date against the ISO text it is stored as in its date member", () => {
    expect.hasAssertions();

    const date = new Date(0);

    expect(getQuery([{ key: "createdAt", operator: BinaryOperator.Gt, value: date }]).params).toStrictEqual([
      "$.createdAt.date",
      date.toISOString(),
    ]);
  });

  test("binds a boolean as the 1 or 0 a JSON boolean reads as", () => {
    expect.hasAssertions();

    expect(getQuery([{ key: "isSpoiler", operator: BinaryOperator.Eq, value: true }]).params).toStrictEqual([
      "$.isSpoiler",
      1,
    ]);
  });

  test("or-groups clauses on one key, and and-joins a range on one key", () => {
    expect.hasAssertions();

    const orSql = getQuery([
      { key: "rowKey", operator: BinaryOperator.Eq, value: "a" },
      { key: "rowKey", operator: BinaryOperator.Eq, value: "b" },
    ]).sql;
    const rangeSql = getQuery([
      { key: "rowKey", operator: BinaryOperator.Ge, value: "a" },
      { key: "rowKey", operator: BinaryOperator.Le, value: "b" },
    ]).sql;

    expect(orSql).toMatch(/ or /u);
    expect(rangeSql).toMatch(/ and /u);
    expect(rangeSql).not.toMatch(/ or /u);
  });

  test("and-joins groups on different keys", () => {
    expect.hasAssertions();

    expect(
      getQuery([
        { key: "partitionKey", operator: BinaryOperator.Eq, value: "room" },
        { key: "rowKey", operator: BinaryOperator.Eq, value: "row" },
      ]).sql,
    ).toMatch(/ and /u);
  });
});
