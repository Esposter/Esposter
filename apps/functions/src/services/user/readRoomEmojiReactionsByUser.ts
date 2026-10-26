import type { Clause, CompositeKey } from "@esposter/azure";
import type {
  AzureTable,
  AzureTableEntityMap,
  CustomTableClient,
  ReverseTickedTimestamp,
  RoomInMessage,
  UserInAuth,
} from "@esposter/db-schema";

import { ArchiveLikeKind } from "#src/models/user/ArchiveLikeKind";
import { AZURE_MAX_PAGE_SIZE, BinaryOperator, CompositeKeyPropertyNames, serializeClauses } from "@esposter/azure";
import { MessageMetadataType, userIdsSchema } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";

// The person's emoji reactions in one room. A row holds every reactor to one emoji on one message, so the reaction is the
// person's when their id is on the row. The row carries no time that is the person's own: its time is its first
// reactor's, so the reaction is written without one
export const readRoomEmojiReactionsByUser = async (
  messagesMetadataClient: CustomTableClient<AzureTableEntityMap[AzureTable.MessagesMetadata]>,
  roomId: RoomInMessage["id"],
  userId: UserInAuth["id"],
) => {
  const clauses: Clause<Record<string, unknown>>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: roomId },
    { key: "type", operator: BinaryOperator.Eq, value: MessageMetadataType.Emoji },
  ];
  const reactions = [];
  for await (const page of messagesMetadataClient
    .listEntities<CompositeKey & { emojiTag: string; messageRowKey: ReverseTickedTimestamp; userIds: string }>({
      queryOptions: { filter: serializeClauses(clauses) },
    })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    for (const { emojiTag, messageRowKey, userIds: serializedUserIds } of page) {
      const userIds = userIdsSchema.shape.userIds.parse(jsonDateParse(serializedUserIds));
      if (userIds.includes(userId))
        reactions.push({ emojiTag, kind: ArchiveLikeKind.Emoji, roomId, targetId: messageRowKey });
    }
  return reactions;
};
