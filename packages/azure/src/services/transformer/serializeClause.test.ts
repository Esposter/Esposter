import { SearchOperator } from "#src/models/search/SearchOperator";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";
import { serializeKey } from "#src/services/table/serializeKey";
import { escapeValue } from "#src/services/transformer/escapeValue";
import { serializeClause } from "#src/services/transformer/serializeClause";
import { describe, expect, test } from "vitest";

describe(serializeClause, () => {
  const values = [CompositeKeyPropertyNames.partitionKey, CompositeKeyPropertyNames.rowKey];

  test("serializes", () => {
    expect.hasAssertions();

    expect(
      serializeClause({ key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: "" }),
    ).toBe(`${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.Eq} ${escapeValue("")}`);
  });

  test(`serializes ${SearchOperator.ArrayAny} as a bare non-empty test`, () => {
    expect.hasAssertions();

    expect(serializeClause({ key: CompositeKeyPropertyNames.partitionKey, operator: SearchOperator.ArrayAny })).toBe(
      `${serializeKey(CompositeKeyPropertyNames.partitionKey)}/any()`,
    );
  });

  test(`serializes ${SearchOperator.ArrayContains} with simple collection key`, () => {
    expect.hasAssertions();

    expect(
      serializeClause({
        key: CompositeKeyPropertyNames.partitionKey,
        operator: SearchOperator.ArrayContains,
        value: values,
      }),
    ).toBe(
      `${serializeKey(CompositeKeyPropertyNames.partitionKey)}/any(x: search.in(x, ${escapeValue(values.join(","))}))`,
    );
  });

  test(`serializes ${SearchOperator.ArrayContains} with collection/property key`, () => {
    expect.hasAssertions();

    expect(
      serializeClause({
        key: `${CompositeKeyPropertyNames.partitionKey}/${CompositeKeyPropertyNames.rowKey}`,
        operator: SearchOperator.ArrayContains,
        value: values,
      }),
    ).toBe(
      `${serializeKey(CompositeKeyPropertyNames.partitionKey)}/any(x: search.in(x/${serializeKey(CompositeKeyPropertyNames.rowKey)}, ${escapeValue(values.join(","))}))`,
    );
  });
});
