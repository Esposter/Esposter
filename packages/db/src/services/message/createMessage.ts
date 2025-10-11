import type { AzureTableEntityMap, CreateMessageInput, CustomTableClient, MessageEntityMap } from "@esposter/db-schema";

import { createEntity } from "@/services/azure/table/createEntity";
import { addMessageMetadata } from "@/services/message/addMessageMetadata";
import { AzureTable, createMessageEntity, getReverseTickedTimestamp } from "@esposter/db-schema";

export const createMessage = async <T extends CreateMessageInput>(
  messageClient: CustomTableClient<AzureTableEntityMap[AzureTable.Messages]>,
  messageAscendingClient: CustomTableClient<AzureTableEntityMap[AzureTable.MessagesAscending]>,
  input: T,
): Promise<MessageEntityMap[T["type"]]> => {
  const messageEntity = createMessageEntity(input);
  await addMessageMetadata(messageEntity);
  await createEntity(messageClient, messageEntity);
  await createEntity(messageAscendingClient, {
    partitionKey: messageEntity.partitionKey,
    rowKey: getReverseTickedTimestamp(messageEntity.rowKey),
  });
  return messageEntity;
};
