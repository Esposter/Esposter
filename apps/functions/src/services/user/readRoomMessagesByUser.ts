import type { StreamTable, StreamTableEntityMap, RoomInMessage, UserInAuth, Clause } from "@esposter/db-schema";
import type { StreamTableClient } from "@esposter/db";

import { deserializeEntity, getLivePartitionClauses } from "@esposter/db";
import { StandardMessageEntity, StandardMessageEntityPropertyNames, BinaryOperator } from "@esposter/db-schema";

// The person's live messages in one room. A soft-deleted message is left out, as it is for every reader of the room.
export const readRoomMessagesByUser = async (
  messageClient: StreamTableClient<StreamTableEntityMap[StreamTable.Messages]>,
  roomId: RoomInMessage["id"],
  userId: UserInAuth["id"],
): Promise<StandardMessageEntity[]> => {
  const clauses: Clause<StandardMessageEntity>[] = [
    ...getLivePartitionClauses<StandardMessageEntity>(roomId),
    { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.Eq, value: userId },
  ];
  const rows = await messageClient.list(clauses);
  // Listed rows carry their properties in stored form, so `files` is only an array once deserialized
  return rows.map(({ etag: _etag, ...entity }) => deserializeEntity(entity, StandardMessageEntity));
};
