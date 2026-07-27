import type { AzureTableEntityMap, CreateMessageInput, CustomTableClient, MessageEntityMap } from "@esposter/db-schema";

import { createEntity } from "@/services/azure/table/createEntity";
import { addMessageMetadata } from "@/services/message/addMessageMetadata";
import { AzureTable, createMessageEntity, getReverseTickedTimestamp } from "@esposter/db-schema";

export const createMessage = async <T extends CreateMessageInput>(
  messageClient: CustomTableClient<AzureTableEntityMap[AzureTable.Messages]>,
  messageAscendingClient: CustomTableClient<AzureTableEntityMap[AzureTable.MessagesAscending]>,
  input: T,
): Promise<InstanceType<MessageEntityMap[T["type"]]>> => {
  const messageEntity = createMessageEntity(input);
  await addMessageMetadata(messageEntity);
  // The index row goes first, and the order is load-bearing: two tables cannot be written atomically, so
  // Whichever lands second decides what a rejection MEANS to the caller. `Messages` is what every read serves,
  // And `MessagesAscending` is only an index into it — one whose orphans `readMessages` already drops when the
  // Join finds no entity. Writing `Messages` first made a rejection ambiguous: the message could already be live
  // In the room, which is what let `sendScheduledMessageNow` re-enqueue an already-delivered job and post it
  // Twice. This way a rejection always means nothing is readable, which is what every caller's rollback assumes.
  // The cost lands on the ascending read, which must not advance its cursor past an index row whose entity has
  // Not arrived yet — `readMessages` holds the page there rather than skipping the message for good.
  await createEntity(messageAscendingClient, {
    partitionKey: messageEntity.partitionKey,
    rowKey: getReverseTickedTimestamp(messageEntity.rowKey),
  });
  await createEntity(messageClient, messageEntity);
  return messageEntity;
};
