import { serializeKey } from "@/services/azure/table/serializeKey";
import { serializeClause } from "@/services/azure/transformer/serializeClause";
import { BinaryOperator, CompositeKeyPropertyNames, escapeValue, SearchOperator } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(serializeClause, () => {
  test("serializes", () => {
    expect.hasAssertions();

    expect(
      serializeClause({ key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: "" }),
    ).toBe(`${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.eq} ${escapeValue("")}`);
  });

  test(`serializes ${SearchOperator.arrayContains} with simple collection key`, () => {
    expect.hasAssertions();

    const values = [CompositeKeyPropertyNames.partitionKey, CompositeKeyPropertyNames.rowKey];

    expect(
      serializeClause({
        key: CompositeKeyPropertyNames.partitionKey,
        operator: SearchOperator.arrayContains,
        value: values,
      }),
    ).toBe(
      `${serializeKey(CompositeKeyPropertyNames.partitionKey)}/any(x: search.in(x, ${escapeValue(values.join(","))}))`,
    );
  });

  test(`serializes ${SearchOperator.arrayContains} with collection/property key`, () => {
    expect.hasAssertions();

    const values = [CompositeKeyPropertyNames.partitionKey, CompositeKeyPropertyNames.rowKey];

    expect(
      serializeClause({
        key: `${CompositeKeyPropertyNames.partitionKey}/${CompositeKeyPropertyNames.rowKey}`,
        operator: SearchOperator.arrayContains,
        value: values,
      }),
    ).toBe(
      `${serializeKey(CompositeKeyPropertyNames.partitionKey)}/any(x: search.in(x/${serializeKey(CompositeKeyPropertyNames.rowKey)}, ${escapeValue(values.join(","))}))`,
    );
  });
});
