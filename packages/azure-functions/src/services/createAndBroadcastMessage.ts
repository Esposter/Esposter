import type { CreateMessageInput, MessageEntityMap } from "@esposter/db-schema";

import { getTableClient } from "@/services/getTableClient";
import { getWebPubSubServiceClient } from "@/services/getWebPubSubServiceClient";
import { createMessage } from "@esposter/db";
import { AzureTable, AzureWebPubSubHub } from "@esposter/db-schema";

export const createAndBroadcastMessage = async <T extends CreateMessageInput>(
  input: T,
): Promise<InstanceType<MessageEntityMap[T["type"]]>> => {
  const messageClient = await getTableClient(AzureTable.Messages);
  const messageAscendingClient = await getTableClient(AzureTable.MessagesAscending);
  const newMessage = await createMessage(messageClient, messageAscendingClient, input);
  const webPubSubServiceClient = getWebPubSubServiceClient(AzureWebPubSubHub.Messages);
  await webPubSubServiceClient.group(newMessage.partitionKey).sendToAll(newMessage);
  return newMessage;
};
