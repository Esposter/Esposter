import { serializeKey } from "@/services/azure/table/serializeKey";
import { deserializeClause } from "@/services/azure/transformer/deserializeClause";
import {
  BinaryOperator,
  CompositeKeyPropertyNames,
  escapeValue,
  serializeValue,
  UnaryOperator,
} from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(deserializeClause, () => {
  test("deserializes with empty key and value", () => {
    expect.hasAssertions();

    expect(deserializeClause(`${BinaryOperator.eq} ${escapeValue("")}`)).toStrictEqual({
      key: "",
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

  test("deserializes numeric literal", () => {
    expect.hasAssertions();

    expect(
      deserializeClause(`${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.eq} 0`),
    ).toStrictEqual({
      key: CompositeKeyPropertyNames.partitionKey,
      not: false,
      operator: BinaryOperator.eq,
      value: 0,
    });
  });
});
