import type { InvocationContext } from "@azure/functions";
import type { CreateMessageInput, MessageTypeEntityMap } from "@esposter/db-schema";

import { getTableClient } from "#src/services/getTableClient";
import { getWebPubSubServiceClient } from "#src/services/getWebPubSubServiceClient";
import { createMessage } from "@esposter/db";
import { AzureTable, AzureWebPubSubHub } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

export const createAndBroadcastMessage = async <T extends CreateMessageInput>(
  context: InvocationContext,
  input: T,
): Promise<InstanceType<MessageTypeEntityMap[T["type"]]>> => {
  const messageClient = await getTableClient(AzureTable.Messages);
  const messageAscendingClient = await getTableClient(AzureTable.MessagesAscending);
  const newMessage = await createMessage(messageClient, messageAscendingClient, input);
  // Broadcast is best-effort: the message is already persisted, so a transient failure here must not
  // Reject and replay the (at-least-once) event, which would create a duplicate message with a fresh rowKey.
  const webPubSubServiceClient = getWebPubSubServiceClient(AzureWebPubSubHub.Messages);
  await getResultAsync(() => webPubSubServiceClient.group(newMessage.partitionKey).sendToAll(newMessage)).match(
    noop,
    (error) => {
      context.error(`Failed to broadcast message ${newMessage.partitionKey}/${newMessage.rowKey}: `, error);
    },
  );
  return newMessage;
};
