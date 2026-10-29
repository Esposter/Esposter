import type { CompositeKey } from "@esposter/azure";
import type { CustomTableClient, UserInAuth } from "@esposter/db-schema";

import { readEntitiesByClauses } from "#src/services/azure/readEntitiesByClauses";
import { BinaryOperator } from "@esposter/azure";

// The records in one moderation table that name the person as their target, across every room.
// The table is partitioned by room, so this reads each partition.
// A record in a room the person has left is one the archive keeps.
export const readModerationRecordsByTarget = <TEntity extends CompositeKey & { targetUserId: UserInAuth["id"] }>(
  tableClient: CustomTableClient<TEntity>,
  targetUserId: UserInAuth["id"],
): Promise<TEntity[]> =>
  readEntitiesByClauses(tableClient, [{ key: "targetUserId", operator: BinaryOperator.Eq, value: targetUserId }]);
