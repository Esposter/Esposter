import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";

import { getReverseTickedTimestamp } from "#shared/services/azure/table/getReverseTickedTimestamp";
import { createMessageEntity as baseCreateMessageEntity } from "#shared/services/message/createMessageEntity";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { addMessageMetadata } from "@@/server/services/message/addMessageMetadata";

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
