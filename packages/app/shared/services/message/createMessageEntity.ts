import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";

import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { getReverseTickedTimestamp } from "#shared/services/azure/table/getReverseTickedTimestamp";

export const createMessageEntity = ({
  message,
  roomId,
  ...rest
}: CreateMessageInput & Pick<MessageEntity, "isForward" | "isLoading" | "userId">) => {
  const createdAt = new Date();
  const messageEntity = new MessageEntity({
    ...rest,
    createdAt,
    message,
    partitionKey: roomId,
    rowKey: getReverseTickedTimestamp(),
    updatedAt: createdAt,
  });
  return messageEntity;
};
