import type { Clause } from "@esposter/azure";
import type { AzureTableEntityMap, CustomTableClient, RoomInMessage, UserInAuth } from "@esposter/db-schema";

import { AZURE_MAX_PAGE_SIZE, BinaryOperator, CompositeKeyPropertyNames, serializeClauses } from "@esposter/azure";
import { serializeEntity } from "@esposter/db";
import { AzureTable, MessageMetadataType, userIdsSchema } from "@esposter/db-schema";

// One row holds every member who reacted with one emoji, so the account's place on a shared row is taken out of its
// userIds and a row it holds alone goes. Each write is conditional on the version it read: a reaction another member
// changed meanwhile fails the step, and the redelivery reads it again rather than overwriting that change
export const deleteAccountRoomReactions = async (
  messagesMetadataClient: CustomTableClient<AzureTableEntityMap[AzureTable.MessagesMetadata]>,
  roomId: RoomInMessage["id"],
  userId: UserInAuth["id"],
): Promise<void> => {
  const clauses: Clause<Record<string, unknown>>[] = [
    { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.Eq, value: roomId },
    { key: "type", operator: BinaryOperator.Eq, value: MessageMetadataType.Emoji },
  ];
  for await (const page of messagesMetadataClient
    .listEntities<{ userIds: string }>({ queryOptions: { filter: serializeClauses(clauses) } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    for (const { etag, partitionKey, rowKey, userIds: serializedUserIds } of page) {
      const userIds = userIdsSchema.shape.userIds.parse(JSON.parse(serializedUserIds));
      if (!userIds.includes(userId)) continue;

      if (userIds.length === 1)
        // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one reaction at a time, as the room's partition is walked
        await messagesMetadataClient.deleteEntity(partitionKey, rowKey, { etag });
      else {
        const remainingReaction = {
          partitionKey,
          rowKey,
          updatedAt: new Date(),
          userIds: userIds.filter((reactorUserId) => reactorUserId !== userId),
        };
        // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one reaction at a time, as the room's partition is walked
        await messagesMetadataClient.updateEntity(serializeEntity(remainingReaction), "Merge", { etag });
      }
    }
};
