import type { CreateMessageInput, CustomTableClient, MessageEntity } from "@esposter/db";

import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { addMessageMetadata } from "@@/server/services/message/addMessageMetadata";
import {
  AzureTable,
  createMessageEntity as baseCreateMessageEntity,
  createEntity,
  getReverseTickedTimestamp,
} from "@esposter/db";

export const createMessage = async (
  messageClient: CustomTableClient<MessageEntity>,
  input: CreateMessageInput & Pick<MessageEntity, "isForward" | "isLoading" | "userId">,
) => {
  const messageEntity = baseCreateMessageEntity(input);
  await addMessageMetadata(messageEntity);
  await createEntity(messageClient, messageEntity);

  const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
  await createEntity(messageAscendingClient, {
    partitionKey: messageEntity.partitionKey,
    rowKey: getReverseTickedTimestamp(messageEntity.rowKey),
  });
  return messageEntity;
};
