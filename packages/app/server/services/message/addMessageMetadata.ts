import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { MessageType } from "#shared/models/db/message/MessageType";
import { MENTION_ID } from "#shared/services/message/constants";
import { getMentions } from "#shared/services/message/getMentions";
import { getLinkPreviewResponse } from "@@/server/services/message/getLinkPreviewResponse";

export const addMessageMetadata = async (messageEntity: MessageEntity) => {
  if (messageEntity.type === MessageType.Message && messageEntity.message) {
    messageEntity.linkPreviewResponse = await getLinkPreviewResponse(messageEntity.message);
    messageEntity.mentions = getMentions(messageEntity.message)
      .map((mention) => mention.getAttribute(MENTION_ID))
      .filter((id) => id !== undefined);
  }
};
