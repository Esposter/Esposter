import { createFilterPredicate } from "@/services/filter/createFilterPredicate";
import { getTableNullClause, serializeClause, serializeClauses } from "@esposter/db";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(createFilterPredicate, () => {
  test("and grouping", () => {
    expect.hasAssertions();

    const predicate = createFilterPredicate(
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

    const predicate = createFilterPredicate(
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

    const predicate = createFilterPredicate(
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

    const predicate = createFilterPredicate(serializeClause(getTableNullClause("")));

    expect(predicate({ "": null, partitionKey: "", rowKey: "" })).toBe(true);
    expect(predicate({ "": "", partitionKey: "", rowKey: "" })).toBe(false);
  });
});
