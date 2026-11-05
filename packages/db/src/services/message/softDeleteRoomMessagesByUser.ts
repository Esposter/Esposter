import type { AzureTable, AzureTableEntityMap, CustomTableClient, StandardMessageEntity } from "@esposter/db-schema";
import type { Promisable } from "type-fest";

import { getLivePartitionClauses } from "#src/services/azure/table/getLivePartitionClauses";
import { updateRoomMessagesByUser } from "#src/services/message/updateRoomMessagesByUser";
import { BinaryOperator } from "@esposter/azure";
import { StandardMessageEntityPropertyNames } from "@esposter/db-schema";

// Soft-deletes every message a user still has visible in a room, one Table batch at a time. `onBatchSoftDeleted`
// Runs as soon as each batch commits, so a purge that stops partway still hides everything it managed to write, and
// Every batch it did hide is handed to the caller to announce
export const softDeleteRoomMessagesByUser = (
  messageClient: CustomTableClient<AzureTableEntityMap[AzureTable.Messages]>,
  roomId: string,
  targetUserId: string,
  onBatchSoftDeleted: (batch: StandardMessageEntity[]) => Promisable<void>,
): Promise<void> =>
  updateRoomMessagesByUser(
    messageClient,
    [
      ...getLivePartitionClauses<StandardMessageEntity>(roomId),
      { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.Eq, value: targetUserId },
    ],
    "Merge",
    (_message, now) => ({ deletedAt: now }),
    onBatchSoftDeleted,
  );
