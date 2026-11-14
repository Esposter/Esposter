import type {
  AdminActionType,
  StreamTable,
  StreamTableEntityMap,
  ReverseTickedTimestamp,
  RoomInMessage,
  UserInAuth,
  CompositeKey,
} from "@esposter/db-schema";
import type { StreamTableClient } from "@esposter/db";

import { readRoomEntitiesByClause } from "#src/services/streams/readRoomEntitiesByClause";

import { getReverseTickedTimestamp, BinaryOperator } from "@esposter/db-schema";

// The moderation actions one person took in one room, each with its action type, its time and the id of the person it
// Was taken against. The row holds no content of the target's, so none is read. The row key is a reverse-ticked timestamp
// In nanoseconds, which the same function reads back
export const readRoomModerationActionsByUser = async (
  moderationLogClient: StreamTableClient<StreamTableEntityMap[StreamTable.ModerationLog]>,
  roomId: RoomInMessage["id"],
  userId: UserInAuth["id"],
) => {
  const entities = await readRoomEntitiesByClause<
    CompositeKey & {
      actorUserId: UserInAuth["id"];
      rowKey: ReverseTickedTimestamp;
      targetUserId: UserInAuth["id"];
      type: AdminActionType;
    }
  >(moderationLogClient, roomId, { key: "actorUserId", operator: BinaryOperator.Eq, value: userId });
  return entities.map(({ rowKey, targetUserId, type }) => ({
    roomId,
    targetUserId,
    time: new Date(Number(BigInt(getReverseTickedTimestamp(rowKey)) / 10n ** 6n)),
    type,
  }));
};
