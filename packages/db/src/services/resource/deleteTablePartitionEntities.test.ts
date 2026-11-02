import type { CompositeKey } from "@esposter/azure";
import type { CustomTableClient } from "@esposter/db-schema";

import { deleteTablePartitionEntities } from "#src/services/resource/deleteTablePartitionEntities";
import { getPartitionKeyFilter } from "@esposter/azure";
import { AzureTable } from "@esposter/db-schema";
import { MockTableClient } from "azure-mock";
import { describe, expect, test, vi } from "vitest";

describe(deleteTablePartitionEntities, () => {
  test("deletes a partition whose row another delete removed after it was listed", async () => {
    expect.hasAssertions();

    const partitionKey = crypto.randomUUID();
    const firstRowKey = crypto.randomUUID();
    const removedRowKey = crypto.randomUUID();
    const lastRowKey = crypto.randomUUID();
    const tableClient = new MockTableClient(
      "",
      AzureTable.ResourceActivity,
    ) as unknown as CustomTableClient<CompositeKey>;
    await Promise.all(
      [firstRowKey, removedRowKey, lastRowKey].map((rowKey) => tableClient.createEntity({ partitionKey, rowKey })),
    );

    // Another delete takes a row between the pass listing the partition and the batch holding that row submitting
    const submitTransaction = tableClient.submitTransaction.bind(tableClient);
    vi.spyOn(tableClient, "submitTransaction").mockImplementationOnce(async (actions) => {
      await tableClient.deleteEntity(partitionKey, removedRowKey);
      return submitTransaction(actions);
    });

    await deleteTablePartitionEntities(tableClient, partitionKey);

    const remainingRowKeys: string[] = [];
    for await (const { rowKey } of tableClient.listEntities<CompositeKey>({
      queryOptions: { filter: getPartitionKeyFilter(partitionKey) },
    }))
      remainingRowKeys.push(rowKey);
    expect(remainingRowKeys).toStrictEqual([]);
  });
});
