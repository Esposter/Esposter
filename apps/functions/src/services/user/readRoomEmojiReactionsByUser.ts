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
import { MessageMetadataType, getReverseTickedTimestamp, userIdsSchema } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";

// The person's emoji reactions in one room. A row holds every reactor to one emoji on one message, so the reaction is the
// person's when their id is on the row. The time is the row's, which is when its first reactor reacted, since the table
// keeps no time per reactor. The row key is a reverse-ticked timestamp in nanoseconds, which the same function reads back
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
    .listEntities<
      CompositeKey & {
        emojiTag: string;
        messageRowKey: ReverseTickedTimestamp;
        rowKey: ReverseTickedTimestamp;
        userIds: string;
      }
    >({ queryOptions: { filter: serializeClauses(clauses) } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    for (const { emojiTag, messageRowKey, rowKey, userIds: serializedUserIds } of page) {
      const userIds = userIdsSchema.shape.userIds.parse(jsonDateParse(serializedUserIds));
      if (userIds.includes(userId))
        reactions.push({
          emojiTag,
          kind: ArchiveLikeKind.Emoji,
          roomId,
          targetId: messageRowKey,
          time: new Date(Number(BigInt(getReverseTickedTimestamp(rowKey)) / 10n ** 6n)),
        });
    }
  return reactions;
};
