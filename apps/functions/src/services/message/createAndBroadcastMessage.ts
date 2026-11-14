import type { CreateMessageInput, MessageTypeEntityMap } from "@esposter/db-schema";

import { getStreamTableClient } from "#src/services/streams/getStreamTableClient";
import { publishToServer } from "#src/services/server/publishToServer";
import { createMessage } from "@esposter/db";
import { StreamTable, PublishEventType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const createAndBroadcastMessage = async <T extends CreateMessageInput>(
  input: T,
): Promise<InstanceType<MessageTypeEntityMap[T["type"]]>> => {
  const messageClient = getStreamTableClient(StreamTable.Messages);
  const newMessage = await createMessage(messageClient, input);
  // Broadcast is best-effort: the message is already persisted, so a transient failure here must not
  // Reject and replay the (at-least-once) event, which would create a duplicate message with a fresh rowKey.
  await getResultAsync(() => publishToServer({ message: newMessage, type: PublishEventType.Message })).match(
    noop,
    (error) => {
      console.error(`Failed to broadcast message ${newMessage.partitionKey}/${newMessage.rowKey}: `, error);
    },
  );
  return newMessage;
};
