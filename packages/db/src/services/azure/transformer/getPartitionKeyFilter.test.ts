import { serializeKey } from "@/services/azure/table/serializeKey";
import { getPartitionKeyFilter } from "@/services/azure/transformer/getPartitionKeyFilter";
import { BinaryOperator, CompositeKeyPropertyNames, escapeValue } from "@esposter/db-schema";
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
