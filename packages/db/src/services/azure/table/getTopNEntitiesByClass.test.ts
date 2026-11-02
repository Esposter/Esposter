import type { CustomTableClient } from "@esposter/db-schema";

import { getTopNEntitiesByClass } from "#src/services/azure/table/getTopNEntitiesByClass";
import { CompositeKey } from "@esposter/azure";
import { AzureTable } from "@esposter/db-schema";
import { MockTableClient } from "azure-mock";
import { describe, expect, test } from "vitest";

describe(getTopNEntitiesByClass, () => {
  test("returns no entities for a topN of zero from a partition that has rows", async () => {
    expect.hasAssertions();

    const partitionKey = crypto.randomUUID();
    const tableClient = new MockTableClient(
      "",
      AzureTable.ResourceActivity,
    ) as unknown as CustomTableClient<CompositeKey>;
    await tableClient.createEntity({ partitionKey, rowKey: crypto.randomUUID() });

    await expect(getTopNEntitiesByClass(tableClient, 0, () => CompositeKey)).resolves.toStrictEqual([]);
  });
});
