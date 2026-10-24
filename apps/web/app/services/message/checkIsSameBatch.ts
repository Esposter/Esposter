import type { MessageEntity } from "@esposter/db-schema";

import { SAME_BATCH_WINDOW_MS } from "@/services/message/constants";
import { MessageType } from "@esposter/db-schema";

// Consecutive messages from one author within the batch window render as one batch. A webhook post is matched by the
// App that sent it, since the posts of one app can carry different user ids
export const checkIsSameBatch = (message: MessageEntity, nextMessage: MessageEntity | undefined) => {
  if (nextMessage === undefined) return false;

  const isSameAuthor =
    message.type === MessageType.Webhook && nextMessage.type === MessageType.Webhook
      ? message.appUser.id === nextMessage.appUser.id
      : message.userId === nextMessage.userId;
  return isSameAuthor && message.createdAt.getTime() - nextMessage.createdAt.getTime() <= SAME_BATCH_WINDOW_MS;
};
