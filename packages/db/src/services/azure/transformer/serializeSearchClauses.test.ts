import { serializeKey } from "@/services/azure/table/serializeKey";
import { serializeSearchClauses } from "@/services/azure/transformer/serializeSearchClauses";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/azure";
import { describe, expect, test } from "vitest";

describe(serializeSearchClauses, () => {
  test("renders a Date as a bare ISO string", () => {
    expect.hasAssertions();

    const epoch = new Date(0);

    expect(
      serializeSearchClauses([{ key: CompositeKeyPropertyNames.rowKey, operator: BinaryOperator.gt, value: epoch }]),
    ).toBe(`${serializeKey(CompositeKeyPropertyNames.rowKey)} ${BinaryOperator.gt} ${epoch.toISOString()}`);
  });
});
