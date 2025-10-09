import type { CreateMessageInput } from "@/models/message/CreateMessageInput";

import { MessageEntity } from "@/models/message/MessageEntity";
import { getReverseTickedTimestamp } from "@esposter/shared";

export const createMessageEntity = ({
  message,
  roomId,
  ...rest
}: CreateMessageInput & Pick<MessageEntity, "isForward" | "isLoading" | "userId">): MessageEntity => {
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
