import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";

import { formatPartitionKey } from "#shared/services/azure/table/formatPartitionKey";
import { getReverseTickedDayTimestamp } from "#shared/services/azure/table/getReverseTickedDayTimestamp";
import { getReverseTickedTimestamp } from "#shared/services/azure/table/getReverseTickedTimestamp";
import { splitFormattedPartitionKey } from "#shared/services/azure/table/splitFormattedPartitionKey";
import { createMessageEntity as baseCreateMessageEntity } from "#shared/services/esbabbler/createMessageEntity";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { getLinkPreviewResponse } from "@@/server/services/esbabbler/getLinkPreviewResponse";

export const createMessage = async (
  messageClient: CustomTableClient<MessageEntity>,
  { message, ...rest }: CreateMessageInput & Pick<MessageEntity, "isForward" | "isLoading" | "userId">,
) => {
  const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
  const messageEntity = baseCreateMessageEntity({ message, ...rest });
  if (message) messageEntity.linkPreviewResponse = await getLinkPreviewResponse(message);
  const [roomId, dayTimestamp] = splitFormattedPartitionKey(messageEntity.partitionKey);
  await createEntity(messageClient, messageEntity);
  await createEntity(messageAscendingClient, {
    partitionKey: formatPartitionKey(roomId, getReverseTickedDayTimestamp(dayTimestamp)),
    rowKey: getReverseTickedTimestamp(messageEntity.rowKey),
  });
  return messageEntity;
};
