import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";
import type { CreateMessageInput, MessageEntity } from "@esposter/db";

import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { addMessageMetadata } from "@@/server/services/message/addMessageMetadata";
import { createMessageEntity as baseCreateMessageEntity } from "@esposter/db";
import { getReverseTickedTimestamp } from "@esposter/shared";

export const createMessage = async (
  messageClient: CustomTableClient<MessageEntity>,
  input: CreateMessageInput & Pick<MessageEntity, "isForward" | "isLoading" | "userId">,
) => {
  const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
  const messageEntity = baseCreateMessageEntity(input);
  await addMessageMetadata(messageEntity);
  await createEntity(messageClient, messageEntity);
  await createEntity(messageAscendingClient, {
    partitionKey: messageEntity.partitionKey,
    rowKey: getReverseTickedTimestamp(messageEntity.rowKey),
  });
  return messageEntity;
};
