import type { CompositeKey } from "@esposter/azure";
import type {
  AzureTable,
  AzureTableEntityMap,
  CustomTableClient,
  ReverseTickedTimestamp,
  RoomInMessage,
  UserInAuth,
} from "@esposter/db-schema";

import { readRoomEntitiesByClause } from "#src/services/azure/readRoomEntitiesByClause";
import { BinaryOperator } from "@esposter/azure";
import { updateEntity } from "@esposter/db";
import { MessageMetadataType, userIdsSchema } from "@esposter/db-schema";
import { checkIsOnlyReactor, getUpdatedUserIds, jsonDateParse } from "@esposter/shared";

// One row holds every member who reacted with one emoji, so the account is taken out of a shared row's
// Reactor list, and a row it holds alone goes. Each write is conditional on the version it read, so a
// Reaction another member changed meanwhile fails the step, and the redelivery reads it again rather than
// Overwriting that change
export const deleteAccountRoomReactions = async (
  messagesMetadataClient: CustomTableClient<AzureTableEntityMap[AzureTable.MessagesMetadata]>,
  roomId: RoomInMessage["id"],
  userId: UserInAuth["id"],
): Promise<void> => {
  const entities = await readRoomEntitiesByClause<
    CompositeKey & { etag: string; rowKey: ReverseTickedTimestamp; userIds: string }
  >(messagesMetadataClient, roomId, { key: "type", operator: BinaryOperator.Eq, value: MessageMetadataType.Emoji });
  for (const { etag, partitionKey, rowKey, userIds: serializedUserIds } of entities) {
    const userIds = userIdsSchema.shape.userIds.parse(jsonDateParse(serializedUserIds));
    if (!userIds.includes(userId)) continue;

    if (checkIsOnlyReactor(userIds, userId))
      // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one reaction at a time, as the room's partition is walked
      await messagesMetadataClient.deleteEntity(partitionKey, rowKey, { etag });
    else {
      // The account is on the row (checked above), so the toggle takes it off
      // A variable, not a literal: the table's entity type has no userIds, so a literal fails the excess-property check
      const remainingReaction = { partitionKey, rowKey, userIds: getUpdatedUserIds(userIds, userId) };
      // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one reaction at a time, as the room's partition is walked
      await updateEntity(messagesMetadataClient, remainingReaction, "Merge", { etag });
    }
  }
};
