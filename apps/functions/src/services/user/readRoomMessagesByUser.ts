import type { Clause } from "@esposter/azure";
import type {
  AzureTable,
  AzureTableEntityMap,
  CustomTableClient,
  RoomInMessage,
  UserInAuth,
} from "@esposter/db-schema";

import { AZURE_MAX_PAGE_SIZE, BinaryOperator, serializeClauses } from "@esposter/azure";
import { deserializeEntity, getLivePartitionClauses } from "@esposter/db";
import { StandardMessageEntity, StandardMessageEntityPropertyNames } from "@esposter/db-schema";

// The person's live messages in one room, read a page at a time.
// A soft-deleted message is left out, as it is for every reader of the room.
export const readRoomMessagesByUser = async (
  messageClient: CustomTableClient<AzureTableEntityMap[AzureTable.Messages]>,
  roomId: RoomInMessage["id"],
  userId: UserInAuth["id"],
): Promise<StandardMessageEntity[]> => {
  const clauses: Clause<StandardMessageEntity>[] = [
    ...getLivePartitionClauses<StandardMessageEntity>(roomId),
    { key: StandardMessageEntityPropertyNames.userId, operator: BinaryOperator.Eq, value: userId },
  ];
  const filter = serializeClauses(clauses);
  const messages: StandardMessageEntity[] = [];
  for await (const page of messageClient
    .listEntities<StandardMessageEntity>({ queryOptions: { filter } })
    .byPage({ maxPageSize: AZURE_MAX_PAGE_SIZE }))
    // Listed entities carry their properties in serialized form, so `files` is only an array once deserialized
    messages.push(...page.map(({ etag: _etag, ...entity }) => deserializeEntity(entity, StandardMessageEntity)));
  return messages;
};
