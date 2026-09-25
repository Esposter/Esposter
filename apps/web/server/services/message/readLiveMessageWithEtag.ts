import type { AzureTable, AzureTableEntityMap, CustomTableClient } from "@esposter/db-schema";

import { getEntityWithEtag } from "@esposter/db";
import { StandardMessageEntity } from "@esposter/db-schema";

// A delete only stamps `deletedAt`, so the row — and the text it held — outlives it. Every point read of one message
// Answers a deleted one as absent here, the way `getLivePartitionClauses` answers it for every listing, so no
// Procedure can edit, pin, vote on or forward a message its author already removed
export const readLiveMessageWithEtag = async (
  messageClient: CustomTableClient<AzureTableEntityMap[AzureTable.Messages]>,
  partitionKey: StandardMessageEntity["partitionKey"],
  rowKey: StandardMessageEntity["rowKey"],
) => {
  const messageEntityWithEtag = await getEntityWithEtag(messageClient, StandardMessageEntity, partitionKey, rowKey);
  return messageEntityWithEtag?.entity.deletedAt ? undefined : messageEntityWithEtag;
};
