import { BinaryOperator } from "#src/models/shared/BinaryOperator";
import { UnaryOperator } from "#src/models/shared/UnaryOperator";
import { CompositeKeyPropertyNames } from "#src/models/table/CompositeKey";
import { serializeKey } from "#src/services/table/serializeKey";
import { escapeValue } from "#src/services/transformer/escapeValue";
import { serializeClauses } from "#src/services/transformer/serializeClauses";
import { describe, expect, test } from "vitest";

describe(serializeClauses, () => {
  test("empty returns empty string", () => {
    expect.hasAssertions();

    expect(serializeClauses([])).toBe("");
  });

  test("single clause", () => {
    expect.hasAssertions();

    const clause = { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: "" };

    expect(serializeClauses([clause])).toBe(
      `${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.Eq} ${escapeValue("")}`,
    );
  });

  test("same key non-range operators are or-grouped", () => {
    expect.hasAssertions();

    expect(
      serializeClauses([
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: "" },
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: "" },
      ]),
    ).toBe(
      `(${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.Eq} ${escapeValue("")} ${UnaryOperator.Or} ${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.Eq} ${escapeValue("")})`,
    );
  });

  test("same key range operators are and-joined", () => {
    expect.hasAssertions();

    expect(
      serializeClauses([
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Ge, value: "" },
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Le, value: "" },
      ]),
    ).toBe(
      `${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.Ge} ${escapeValue("")} ${UnaryOperator.And} ${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.Le} ${escapeValue("")}`,
    );
  });

  test("renders a Date as an Azure Table datetime literal", () => {
    expect.hasAssertions();

    const epoch = new Date(0);

    expect(
      serializeClauses([{ key: CompositeKeyPropertyNames.rowKey, operator: BinaryOperator.Gt, value: epoch }]),
    ).toBe(`${serializeKey(CompositeKeyPropertyNames.rowKey)} ${BinaryOperator.Gt} datetime'${epoch.toISOString()}'`);
  });

  test("different key groups are and-joined", () => {
    expect.hasAssertions();

    expect(
      serializeClauses([
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: "" },
        { key: CompositeKeyPropertyNames.rowKey, operator: BinaryOperator.Eq, value: "" },
      ]),
    ).toBe(
      `${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.Eq} ${escapeValue("")} ${UnaryOperator.And} ${serializeKey(CompositeKeyPropertyNames.rowKey)} ${BinaryOperator.Eq} ${escapeValue("")}`,
    );
  });
});
