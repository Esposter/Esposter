import { BinaryOperator } from "@/models/azure/BinaryOperator";
import { CompositeKeyPropertyNames } from "@/models/azure/table/CompositeKey";
import { UnaryOperator } from "@/models/azure/UnaryOperator";
import { deserializeClause } from "@/services/azure/deserializeClause";
import { escapeValue } from "@/services/azure/escapeValue";
import { serializeValue } from "@/services/azure/serializeValue";
import { serializeKey } from "@/services/azure/table/serializeKey";
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
});
