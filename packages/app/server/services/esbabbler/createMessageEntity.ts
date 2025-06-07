import type { CreateMessageInput } from "#shared/models/db/message/CreateMessageInput";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { createMessageEntity as baseCreateMessageEntity } from "#shared/services/esbabbler/createMessageEntity";
import { getLinkPreviewResponse } from "@@/server/services/esbabbler/getLinkPreviewResponse";

export const createMessageEntity = async ({
  message,
  ...rest
}: CreateMessageInput & Pick<MessageEntity, "isForward" | "isLoading" | "userId">) => {
  const messageEntity = baseCreateMessageEntity({ message, ...rest });
  if (message) {
    const linkPreviewResponse = await getLinkPreviewResponse(message);
    if (linkPreviewResponse) messageEntity.linkPreviewResponse = linkPreviewResponse;
  }
  return messageEntity;
};
