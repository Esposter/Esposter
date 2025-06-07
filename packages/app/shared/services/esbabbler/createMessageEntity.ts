import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";

import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { getReverseTickedTimestamp } from "#shared/services/azure/table/getReverseTickedTimestamp";
import { getMessagesPartitionKey } from "#shared/services/esbabbler/getMessagesPartitionKey";
import { getIsServer } from "#shared/util/environment/getIsServer";

export const createMessageEntity = async ({
  message,
  roomId,
  ...rest
}: CreateMessageInput & Pick<MessageEntity, "isForward" | "isLoading" | "userId">) => {
  const createdAt = new Date();
  const messageEntity = new MessageEntity({
    ...rest,
    createdAt,
    message,
    partitionKey: getMessagesPartitionKey(roomId, createdAt),
    rowKey: getReverseTickedTimestamp(),
    updatedAt: createdAt,
  });
  if (getIsServer() && message) {
    const getLinkPreviewResponse = (await import("@@/server/services/esbabbler/getLinkPreviewResponse"))
      .getLinkPreviewResponse;
    const linkPreviewResponse = await getLinkPreviewResponse(message);
    if (linkPreviewResponse) messageEntity.linkPreviewResponse = linkPreviewResponse;
  }
  return messageEntity;
};
