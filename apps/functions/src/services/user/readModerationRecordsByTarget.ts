import type { UserInAuth, CompositeKey } from "@esposter/db-schema";
import { BinaryOperator } from "@esposter/db-schema";
import type { StreamTableClient } from "@esposter/db";

import { readEntitiesByClauses } from "#src/services/streams/readEntitiesByClauses";

// The records in one moderation table that name the person as their target, across every room.
// The table is partitioned by room, so this reads each partition.
// A record in a room the person has left is one the archive keeps.
export const readModerationRecordsByTarget = <TEntity extends CompositeKey & { targetUserId: UserInAuth["id"] }>(
  tableClient: StreamTableClient<TEntity>,
  targetUserId: UserInAuth["id"],
): Promise<TEntity[]> =>
  readEntitiesByClauses(tableClient, [{ key: "targetUserId", operator: BinaryOperator.Eq, value: targetUserId }]);
