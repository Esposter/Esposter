import { BinaryOperator } from "@/models/azure/BinaryOperator";
import { SearchOperator } from "@/models/azure/SearchOperator";
import { CompositeKeyPropertyNames } from "@/models/azure/table/CompositeKey";
import { escapeValue } from "@/services/azure/escapeValue";
import { serializeClause } from "@/services/azure/serializeClause";
import { serializeKey } from "@/services/azure/table/serializeKey";
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
