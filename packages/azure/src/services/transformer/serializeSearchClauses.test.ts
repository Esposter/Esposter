import { BinaryOperator } from "#src/models/BinaryOperator";
import { CompositeKeyPropertyNames } from "#src/models/table/CompositeKey";
import { serializeKey } from "#src/services/table/serializeKey";
import { serializeSearchClauses } from "#src/services/transformer/serializeSearchClauses";
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
