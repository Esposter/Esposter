import { BinaryOperator } from "#src/models/BinaryOperator";
import { CompositeKeyPropertyNames } from "#src/models/table/CompositeKey";
import { serializeKey } from "#src/services/table/serializeKey";
import { escapeValue } from "#src/services/transformer/escapeValue";
import { getPartitionKeyFilter } from "#src/services/transformer/getPartitionKeyFilter";
import { describe, expect, test } from "vitest";

describe(getPartitionKeyFilter, () => {
  const partitionKey = "1";

  test("filters to one partition", () => {
    expect.hasAssertions();

    expect(getPartitionKeyFilter(partitionKey)).toBe(
      `${serializeKey(CompositeKeyPropertyNames.partitionKey)} ${BinaryOperator.eq} ${escapeValue(partitionKey)}`,
    );
  });
});
