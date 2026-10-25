import type { Clause, CompositeKey } from "@esposter/azure";
import type {
  AzureTable,
  AzureTableEntityMap,
  CustomTableClient,
  RoomInMessage,
  UserInAuth,
} from "@esposter/db-schema";

import { AZURE_MAX_PAGE_SIZE, BinaryOperator, CompositeKeyPropertyNames, serializeClauses } from "@esposter/azure";
import { checkIsOnlyReactor, updateEntity } from "@esposter/db";
import { MessageMetadataType, userIdsSchema } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";

// One row holds every member who reacted with one emoji, so the account is taken out of a shared row's
// Reactor list, and a row it holds alone goes. Each write is conditional on the version it read, so a
// Reaction another member changed meanwhile fails the step, and the redelivery reads it again rather than
// Overwriting that change
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
    .listEntities<CompositeKey & { userIds: string }>({ queryOptions: { filter: serializeClauses(clauses) } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    for (const { etag, partitionKey, rowKey, userIds: serializedUserIds } of page) {
      const userIds = userIdsSchema.shape.userIds.parse(jsonDateParse(serializedUserIds));
      if (!userIds.includes(userId)) continue;

      if (checkIsOnlyReactor(userIds, userId))
        // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one reaction at a time, as the room's partition is walked
        await messagesMetadataClient.deleteEntity(partitionKey, rowKey, { etag });
      else
        // oxlint-disable-next-line no-await-in-loop -- Bounded concurrency: one reaction at a time, as the room's partition is walked
        await updateEntity(
          messagesMetadataClient,
          { partitionKey, rowKey, userIds: userIds.filter((reactorUserId) => reactorUserId !== userId) },
          "Merge",
          { etag },
        );
    }
};
