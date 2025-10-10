import { createTableFilterPredicate } from "@/services/table/createTableFilterPredicate";
import { BinaryOperator, getTableNullClause, serializeClause, serializeClauses } from "@esposter/db";
import { describe, expect, test } from "vitest";

describe(createTableFilterPredicate, () => {
  const partitionKey = "partitionKey";
  const rowKey = "rowKey";

  test("and grouping", () => {
    expect.hasAssertions();

    const predicate = createTableFilterPredicate(
      serializeClauses([
        { key: "a", operator: BinaryOperator.eq, value: 0 },
        { key: "b", operator: BinaryOperator.eq, value: 0 },
      ]),
    );

    expect(predicate({ a: 0, b: 0, partitionKey, rowKey })).toBe(true);
    expect(predicate({ a: 0, b: 1, partitionKey, rowKey })).toBe(false);
  });

  test("or grouping", () => {
    expect.hasAssertions();

    const predicate = createTableFilterPredicate(
      serializeClauses([
        { key: "a", operator: BinaryOperator.eq, value: 0 },
        { key: "a", operator: BinaryOperator.eq, value: 1 },
      ]),
    );

    expect(predicate({ a: 0, partitionKey, rowKey })).toBe(true);
    expect(predicate({ a: 1, partitionKey, rowKey })).toBe(true);
    expect(predicate({ a: -1, partitionKey, rowKey })).toBe(false);
  });

  test("negates with not(...)", () => {
    expect.hasAssertions();

    const predicate = createTableFilterPredicate(
      serializeClause({ key: "a", not: true, operator: BinaryOperator.eq, value: 0 }),
    );

    expect(predicate({ a: 1, partitionKey, rowKey })).toBe(true);
    expect(predicate({ a: 0, partitionKey, rowKey })).toBe(false);
  });

  test("null clause", () => {
    expect.hasAssertions();

    const predicate = createTableFilterPredicate(serializeClause(getTableNullClause("a")));

    expect(predicate({ a: null, partitionKey, rowKey })).toBe(true);
    expect(predicate({ a: 0, partitionKey, rowKey })).toBe(false);
  });
});
