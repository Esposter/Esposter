import type { StreamTableClient } from "#src/models/streams/StreamTableClient";
import type { CompositeKey } from "@esposter/db-schema";

import { deleteTablePartitionEntities } from "#src/services/resource/deleteTablePartitionEntities";
import { MAX_BATCH_SIZE } from "#src/services/shared/constants";
import { getPartitionClauses } from "#src/services/streams/getPartitionClauses";
import { v7 } from "uuid";
import { describe, expect, test, vi } from "vitest";

describe(deleteTablePartitionEntities, () => {
  test("deletes every row the partition lists, one batch of rows at a time", async () => {
    expect.hasAssertions();

    const partitionKey = v7();
    const rows = Array.from({ length: MAX_BATCH_SIZE + 1 }, () => ({ partitionKey, rowKey: v7() }));
    const tableClient = { list: vi.fn(() => Promise.resolve(rows)), submitTransaction: vi.fn(() => Promise.resolve()) };

    await deleteTablePartitionEntities(tableClient as unknown as StreamTableClient<CompositeKey>, partitionKey);

    expect(tableClient.list).toHaveBeenCalledExactlyOnceWith(getPartitionClauses(partitionKey));
    expect(tableClient.submitTransaction.mock.calls.map(([actions]) => actions.length)).toStrictEqual([
      MAX_BATCH_SIZE,
      1,
    ]);
    expect(tableClient.submitTransaction.mock.calls.flatMap(([actions]) => actions)).toStrictEqual(
      rows.map(({ partitionKey: rowPartitionKey, rowKey }) => ["delete", { partitionKey: rowPartitionKey, rowKey }]),
    );
  });
});
