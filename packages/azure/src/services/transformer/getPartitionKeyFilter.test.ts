import { BinaryOperator } from "#src/models/shared/BinaryOperator";
import { CompositeKeyPropertyNames } from "#src/models/table/CompositeKey";
import { serializeKey } from "#src/services/table/serializeKey";
import { escapeValue } from "#src/services/transformer/escapeValue";
import { getPartitionKeyFilter } from "#src/services/transformer/getPartitionKeyFilter";
import { describe, expect, test } from "vitest";

describe(getPartitionKeyFilter, () => {
  const partitionKey = "";

  test("filters to one partition", () => {
    expect.hasAssertions();

    expect(getPartitionKeyFilter(partitionKey)).toBe(
      `${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.Eq} ${escapeValue(partitionKey)}`,
    );
  });
});
