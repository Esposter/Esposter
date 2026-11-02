import { createFilterPredicate } from "#src/services/filter/createFilterPredicate";
import {
  BinaryOperator,
  CompositeKeyPropertyNames,
  getTableNullClause,
  serializeClause,
  serializeClauses,
} from "@esposter/azure";
import { describe, expect, test } from "vitest";

describe(createFilterPredicate, () => {
  test("and grouping", () => {
    expect.hasAssertions();

    const predicate = createFilterPredicate(
      serializeClauses([
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: "" },
        { key: CompositeKeyPropertyNames.rowKey, operator: BinaryOperator.Eq, value: "" },
      ]),
    );

    expect(predicate({ partitionKey: "", rowKey: "" })).toBe(true);
    expect(predicate({ partitionKey: "", rowKey: " " })).toBe(false);
  });

  test("or grouping", () => {
    expect.hasAssertions();

    const predicate = createFilterPredicate(
      serializeClauses([
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: "" },
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: " " },
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
        operator: BinaryOperator.Eq,
        value: "",
      }),
    );

    expect(predicate({ partitionKey: "", rowKey: "" })).toBe(false);
    expect(predicate({ partitionKey: " ", rowKey: "" })).toBe(true);
  });

  // The service reads a quoted value whole, so the parentheses inside it are part of the value, not grouping
  test("matches a quoted value holding parentheses as the value itself", () => {
    expect.hasAssertions();

    const predicate = createFilterPredicate(
      serializeClauses([{ key: CompositeKeyPropertyNames.rowKey, operator: BinaryOperator.Eq, value: "a(b)" }]),
    );

    expect(predicate({ rowKey: "a(b)" })).toBe(true);
    expect(predicate({ rowKey: "a b" })).toBe(false);
  });

  // A quoted value holding the word `and` is not two clauses joined by it
  test("matches a quoted value holding and as the value itself", () => {
    expect.hasAssertions();

    const predicate = createFilterPredicate(
      serializeClauses([{ key: CompositeKeyPropertyNames.rowKey, operator: BinaryOperator.Eq, value: "x and y" }]),
    );

    expect(predicate({ rowKey: "x and y" })).toBe(true);
    expect(predicate({ rowKey: "x" })).toBe(false);
  });

  test("null clause", () => {
    expect.hasAssertions();

    const predicate = createFilterPredicate(serializeClause(getTableNullClause("")));

    expect(predicate({ "": null, partitionKey: "", rowKey: "" })).toBe(true);
    expect(predicate({ "": "", partitionKey: "", rowKey: "" })).toBe(false);
  });
});
