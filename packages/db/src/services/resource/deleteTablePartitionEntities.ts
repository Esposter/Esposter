import type { StreamTableAction } from "#src/models/streams/StreamTableAction";
import type { StreamTableClient } from "#src/models/streams/StreamTableClient";
import type { CompositeKey } from "@esposter/db-schema";

import { MAX_BATCH_SIZE } from "#src/services/shared/constants";
import { getPartitionClauses } from "#src/services/streams/getPartitionClauses";
import { chunk } from "@esposter/shared";

// Clears a partition by listing its rows and deleting them one batch at a time. A row another write removed between
// the listing and its batch is simply gone, which a delete leaves alone, so a retry converges
export const deleteTablePartitionEntities = async (
  tableClient: StreamTableClient<CompositeKey>,
  partitionKey: string,
) => {
  const rows = await tableClient.list(getPartitionClauses<CompositeKey>(partitionKey));
  for (const batch of chunk(rows, MAX_BATCH_SIZE))
    await tableClient.submitTransaction(
      batch.map(({ partitionKey: entityPartitionKey, rowKey }): StreamTableAction => [
        "delete",
        { partitionKey: entityPartitionKey, rowKey },
      ]),
    );
};
