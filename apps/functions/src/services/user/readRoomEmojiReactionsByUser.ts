import type { CompositeKey } from "@esposter/azure";
import type {
  AzureTable,
  AzureTableEntityMap,
  CustomTableClient,
  ReverseTickedTimestamp,
  RoomInMessage,
  UserInAuth,
} from "@esposter/db-schema";

import { ArchiveLikeKind } from "#src/models/user/ArchiveLikeKind";
import { readRoomEntitiesByClause } from "#src/services/azure/readRoomEntitiesByClause";
import { BinaryOperator } from "@esposter/azure";
import { MessageMetadataType, userIdsSchema } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";

// The person's emoji reactions in one room. A row holds every reactor to one emoji on one message, so the reaction is the
// Person's when their id is on the row. The row carries no time that is the person's own: its time is its first
// Reactor's, so the reaction is written without one
export const readRoomEmojiReactionsByUser = async (
  messagesMetadataClient: CustomTableClient<AzureTableEntityMap[AzureTable.MessagesMetadata]>,
  roomId: RoomInMessage["id"],
  userId: UserInAuth["id"],
) => {
  const entities = await readRoomEntitiesByClause<
    CompositeKey & { emojiTag: string; messageRowKey: ReverseTickedTimestamp; userIds: string }
  >(messagesMetadataClient, roomId, { key: "type", operator: BinaryOperator.Eq, value: MessageMetadataType.Emoji });
  const reactions = [];
  for (const { emojiTag, messageRowKey, userIds: serializedUserIds } of entities) {
    const userIds = userIdsSchema.shape.userIds.parse(jsonDateParse(serializedUserIds));
    if (userIds.includes(userId))
      reactions.push({ emojiTag, kind: ArchiveLikeKind.Emoji, roomId, targetId: messageRowKey });
  }
  return reactions;
};
