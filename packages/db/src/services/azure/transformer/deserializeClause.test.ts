import { serializeKey } from "@/services/azure/table/serializeKey";
import { deserializeClause } from "@/services/azure/transformer/deserializeClause";
import { escapeValue } from "@/services/azure/transformer/escapeValue";
import { serializeValue } from "@/services/azure/transformer/serializeValue";
import { BinaryOperator, CompositeKeyPropertyNames, UnaryOperator } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(deserializeClause, () => {
  test("deserializes", () => {
    expect.hasAssertions();

    expect(
      deserializeClause(
        `${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.eq} ${escapeValue("")}`,
      ),
    ).toStrictEqual({
      key: CompositeKeyPropertyNames.partitionKey,
      not: false,
      operator: BinaryOperator.eq,
      value: "",
    });
  });

  test(`deserializes with ${UnaryOperator.not} flag and special literals`, () => {
    expect.hasAssertions();

    expect(
      deserializeClause(
        `${UnaryOperator.not} ${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.eq} ${serializeValue(null)}`,
      ),
    ).toStrictEqual({
      key: CompositeKeyPropertyNames.partitionKey,
      not: true,
      operator: BinaryOperator.eq,
      value: null,
    });
    expect(
      deserializeClause(
        `${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.eq} ${serializeValue(Number.NaN)}`,
      ),
    ).toStrictEqual({
      key: CompositeKeyPropertyNames.partitionKey,
      not: false,
      operator: BinaryOperator.eq,
      value: Number.NaN,
    });
  });

  test("deserializes unquoted numeric literal", () => {
    expect.hasAssertions();

    expect(deserializeClause(`a ${BinaryOperator.eq} 0`)).toStrictEqual({
      key: "a",
      not: false,
      operator: BinaryOperator.eq,
      value: 0,
    });
  });
});
