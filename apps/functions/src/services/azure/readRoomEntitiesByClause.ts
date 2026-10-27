import type { Clause, CompositeKey } from "@esposter/azure";
import type { CustomTableClient, RoomInMessage } from "@esposter/db-schema";

import { readEntitiesByClauses } from "#src/services/azure/readEntitiesByClauses";
import { BinaryOperator, CompositeKeyPropertyNames } from "@esposter/azure";

// The rows of one room that match one more clause. A room's rows share its id as their partition key, so the room is the
// First clause every such read names
export const readRoomEntitiesByClause = <TEntity extends CompositeKey>(
  tableClient: CustomTableClient<CompositeKey>,
  roomId: RoomInMessage["id"],
  clause: Clause<Record<string, unknown>>,
): Promise<TEntity[]> =>
  readEntitiesByClauses<TEntity>(tableClient, [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: roomId },
    clause,
  ]);
