import type { AzureTableEntityMap, CreateMessageInput, CustomTableClient, MessageEntity } from "@esposter/db-schema";

import { createEntity } from "@/services/azure/table/createEntity";
import { addMessageMetadata } from "@/services/message/addMessageMetadata";
import {
  AzureTable,
  createMessageEntity as baseCreateMessageEntity,
  getReverseTickedTimestamp,
} from "@esposter/db-schema";

export const createMessage = async (
  messageClient: CustomTableClient<AzureTableEntityMap[AzureTable.Messages]>,
  messageAscendingClient: CustomTableClient<AzureTableEntityMap[AzureTable.MessagesAscending]>,
  input: CreateMessageInput & Pick<MessageEntity, "isForward" | "isLoading" | "userId">,
) => {
  const messageEntity = baseCreateMessageEntity(input);
  await addMessageMetadata(messageEntity);
  await createEntity(messageClient, messageEntity);
  await createEntity(messageAscendingClient, {
    partitionKey: messageEntity.partitionKey,
    rowKey: getReverseTickedTimestamp(messageEntity.rowKey),
  });
  return messageEntity;
};
