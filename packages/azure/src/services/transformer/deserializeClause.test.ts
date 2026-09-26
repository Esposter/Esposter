import { BinaryOperator } from "#src/models/shared/BinaryOperator";
import { UnaryOperator } from "#src/models/shared/UnaryOperator";
import { CompositeKeyPropertyNames } from "#src/models/table/CompositeKey";
import { serializeKey } from "#src/services/table/serializeKey";
import { deserializeClause } from "#src/services/transformer/deserializeClause";
import { escapeValue } from "#src/services/transformer/escapeValue";
import { serializeValue } from "#src/services/transformer/serializeValue";
import { describe, expect, test } from "vitest";

describe(deserializeClause, () => {
  test("deserializes with empty key and value", () => {
    expect.hasAssertions();

    expect(deserializeClause(`${BinaryOperator.Eq} ${escapeValue("")}`)).toStrictEqual({
      key: "",
      not: false,
      operator: BinaryOperator.Eq,
      value: "",
    });
  });

  test(`deserializes with ${UnaryOperator.Not} flag and special literals`, () => {
    expect.hasAssertions();

    expect(
      deserializeClause(
        `${UnaryOperator.Not} ${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.Eq} ${serializeValue(null)}`,
      ),
    ).toStrictEqual({
      key: CompositeKeyPropertyNames.partitionKey,
      not: true,
      operator: BinaryOperator.Eq,
      value: null,
    });
    expect(
      deserializeClause(
        `${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.Eq} ${serializeValue(Number.NaN)}`,
      ),
    ).toStrictEqual({
      key: CompositeKeyPropertyNames.partitionKey,
      not: false,
      operator: BinaryOperator.Eq,
      value: Number.NaN,
    });
  });

  test("deserializes a value whose embedded quote was doubled", () => {
    expect.hasAssertions();

    const value = "'";

    expect(
      deserializeClause(
        `${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.Eq} ${escapeValue(value)}`,
      ),
    ).toStrictEqual({ key: CompositeKeyPropertyNames.partitionKey, not: false, operator: BinaryOperator.Eq, value });
  });

  test("deserializes numeric literal", () => {
    expect.hasAssertions();

    expect(
      deserializeClause(`${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.Eq} 0`),
    ).toStrictEqual({ key: CompositeKeyPropertyNames.partitionKey, not: false, operator: BinaryOperator.Eq, value: 0 });
  });
});
