import type {
  AzureTableEntityMap,
  CreateMessageInput,
  CustomTableClient,
  MessageTypeEntityMap,
} from "@esposter/db-schema";

import { createEntity } from "#src/services/azure/table/createEntity";
import { addMessageMetadata } from "#src/services/message/addMessageMetadata";
import { AzureTable, createMessageEntity, getReverseTickedTimestamp } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const createMessage = async <T extends CreateMessageInput>(
  messageClient: CustomTableClient<AzureTableEntityMap[AzureTable.Messages]>,
  messageAscendingClient: CustomTableClient<AzureTableEntityMap[AzureTable.MessagesAscending]>,
  input: T,
): Promise<InstanceType<MessageTypeEntityMap[T["type"]]>> => {
  const messageEntity = createMessageEntity(input);
  await addMessageMetadata(messageEntity);
  // The index row goes first, and the order is load-bearing: two tables cannot be written atomically, so
  // Whichever lands second decides what a rejection MEANS to the caller. `Messages` is what every read serves,
  // And `MessagesAscending` is only an index into it — one whose orphans `readMessages` already drops when the
  // Join finds no entity. Written the other way round a rejection is ambiguous — the message may already be live
  // In the room — which is what would let `sendScheduledMessageNow` re-enqueue an already-delivered job and post
  // It twice. This way a rejection always means nothing is readable, which every caller's rollback assumes.
  // The residual cost is a window in which the index names a message the join cannot yet serve: an ascending page
  // Landing inside it skips that message, and the client is told about it by the subscription instead.
  const ascendingRowKey = getReverseTickedTimestamp(messageEntity.rowKey);
  await createEntity(messageAscendingClient, {
    partitionKey: messageEntity.partitionKey,
    rowKey: ascendingRowKey,
  });
  // Drop the index row again if the entity never lands. Ascending reads join through this index and skip a row the
  // Join cannot match — they must, since a soft delete leaves exactly the same shape — so an index row that never
  // Gets an entity is not a message anyone recovers, just a row every ascending page pays to read and discard
  // Forever. This is what keeps the unmatched window to one in-flight write.
  await getResultAsync(() => createEntity(messageClient, messageEntity)).match(noop, async (error) => {
    // Logged, never swallowed silently: this is the one failure that makes the unmatched window permanent
    // Rather than one in-flight write, so it is exactly the case that must leave a trace to be found by.
    await getResultAsync(() => messageAscendingClient.deleteEntity(messageEntity.partitionKey, ascendingRowKey)).match(
      noop,
      console.error,
    );
    throw error;
  });
  return messageEntity;
};
