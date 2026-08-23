import { serializeKey } from "#src/services/azure/table/serializeKey";
import { getPartitionKeyFilter } from "#src/services/azure/transformer/getPartitionKeyFilter";
import { BinaryOperator, CompositeKeyPropertyNames, escapeValue } from "@esposter/azure";
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
