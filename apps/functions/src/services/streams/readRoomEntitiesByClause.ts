import type { RoomInMessage, Clause, CompositeKey } from "@esposter/db-schema";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/db-schema";
import type { StreamTableClient } from "@esposter/db";

import { readEntitiesByClauses } from "#src/services/streams/readEntitiesByClauses";

// The rows of one room that match one more clause. A room's rows share its id as their partition key, so the room is the
// First clause every such read names
export const readRoomEntitiesByClause = <TEntity extends CompositeKey>(
  tableClient: StreamTableClient<CompositeKey>,
  roomId: RoomInMessage["id"],
  clause: Clause<Record<string, unknown>>,
): Promise<TEntity[]> =>
  readEntitiesByClauses<TEntity>(tableClient, [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: roomId },
    clause,
  ]);
