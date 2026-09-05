import { BinaryOperator } from "#src/models/BinaryOperator";
import { CompositeKeyPropertyNames } from "#src/models/table/CompositeKey";
import { UnaryOperator } from "#src/models/UnaryOperator";
import { serializeKey } from "#src/services/table/serializeKey";
import { deserializeClause } from "#src/services/transformer/deserializeClause";
import { escapeValue } from "#src/services/transformer/escapeValue";
import { serializeValue } from "#src/services/transformer/serializeValue";
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

  test("deserializes a value whose embedded quote was doubled", () => {
    expect.hasAssertions();

    const value = "'";

    expect(
      deserializeClause(
        `${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.eq} ${escapeValue(value)}`,
      ),
    ).toStrictEqual({
      key: CompositeKeyPropertyNames.partitionKey,
      not: false,
      operator: BinaryOperator.eq,
      value,
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
