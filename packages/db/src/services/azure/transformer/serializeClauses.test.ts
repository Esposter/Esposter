import { serializeKey } from "@/services/azure/table/serializeKey";
import { serializeClauses } from "@/services/azure/transformer/serializeClauses";
import { BinaryOperator, CompositeKeyPropertyNames, escapeValue, UnaryOperator } from "@esposter/azure";
import { describe, expect, test } from "vitest";

describe(serializeClauses, () => {
  test("empty returns empty string", () => {
    expect.hasAssertions();

    expect(serializeClauses([])).toBe("");
  });

  test("single clause", () => {
    expect.hasAssertions();

    const clause = { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: "" };

    expect(serializeClauses([clause])).toBe(
      `${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.eq} ${escapeValue("")}`,
    );
  });

  test("same key non-range operators are or-grouped", () => {
    expect.hasAssertions();

    expect(
      serializeClauses([
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: "" },
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: "" },
      ]),
    ).toBe(
      `(${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.eq} ${escapeValue("")} ${UnaryOperator.or} ${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.eq} ${escapeValue("")})`,
    );
  });

  test("same key range operators are and-joined", () => {
    expect.hasAssertions();

    expect(
      serializeClauses([
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.ge, value: "" },
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.le, value: "" },
      ]),
    ).toBe(
      `${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.ge} ${escapeValue("")} ${UnaryOperator.and} ${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.le} ${escapeValue("")}`,
    );
  });

  test("renders a Date as an Azure Table datetime literal", () => {
    expect.hasAssertions();

    const epoch = new Date(0);

    expect(
      serializeClauses([{ key: CompositeKeyPropertyNames.rowKey, operator: BinaryOperator.gt, value: epoch }]),
    ).toBe(`${serializeKey(CompositeKeyPropertyNames.rowKey)} ${BinaryOperator.gt} datetime'${epoch.toISOString()}'`);
  });

  test("different key groups are and-joined", () => {
    expect.hasAssertions();

    expect(
      serializeClauses([
        { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: "" },
        { key: CompositeKeyPropertyNames.rowKey, operator: BinaryOperator.eq, value: "" },
      ]),
    ).toBe(
      `${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.eq} ${escapeValue("")} ${UnaryOperator.and} ${serializeKey(CompositeKeyPropertyNames.rowKey)} ${BinaryOperator.eq} ${escapeValue("")}`,
    );
  });
});
