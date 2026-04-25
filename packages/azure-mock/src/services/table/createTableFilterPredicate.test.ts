import { createTableFilterPredicate } from "@/services/table/createTableFilterPredicate";
import { getTableNullClause, serializeClause, serializeClauses } from "@esposter/db";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(createTableFilterPredicate, () => {
  test("and grouping", () => {
    expect.hasAssertions();

    const predicate = createTableFilterPredicate(
      serializeClauses([
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: "" },
        { key: CompositeKeyPropertyNames.rowKey, operator: BinaryOperator.eq, value: "" },
      ]),
    );

    expect(predicate({ partitionKey: "", rowKey: "" })).toBe(true);
    expect(predicate({ partitionKey: "", rowKey: " " })).toBe(false);
  });

  test("or grouping", () => {
    expect.hasAssertions();

    const predicate = createTableFilterPredicate(
      serializeClauses([
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: "" },
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: " " },
      ]),
    );

    expect(predicate({ partitionKey: "", rowKey: "" })).toBe(true);
    expect(predicate({ partitionKey: " ", rowKey: "" })).toBe(true);
  });

  test("negates with not(...)", () => {
    expect.hasAssertions();

    const predicate = createTableFilterPredicate(
      serializeClause({
        key: CompositeKeyPropertyNames.partitionKey,
        not: true,
        operator: BinaryOperator.eq,
        value: "",
      }),
    );

    expect(predicate({ partitionKey: "", rowKey: "" })).toBe(false);
    expect(predicate({ partitionKey: " ", rowKey: "" })).toBe(true);
  });

  test("null clause", () => {
    expect.hasAssertions();

    const predicate = createTableFilterPredicate(serializeClause(getTableNullClause("")));

    expect(predicate({ "": null, partitionKey: "", rowKey: "" })).toBe(true);
    expect(predicate({ "": "", partitionKey: "", rowKey: "" })).toBe(false);
  });
});
