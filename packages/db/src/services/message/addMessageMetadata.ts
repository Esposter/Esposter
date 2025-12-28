import type { AzureUpdateEntity, MessageEntityMap } from "@esposter/db-schema";

import { getLinkPreviewResponse } from "@/services/message/getLinkPreviewResponse";
import { MessageType } from "@esposter/db-schema";
import { getMentions, MENTION_ID_ATTRIBUTE, Operation } from "@esposter/shared";

export const addMessageMetadata = async (
  messageEntity: AzureUpdateEntity<InstanceType<MessageEntityMap[MessageType]>>,
  operation: Operation.Create | Operation.Update = Operation.Create,
) => {
  if (operation === Operation.Update) {
    messageEntity.isEdited = true;
    if (messageEntity.message !== undefined)
      messageEntity.mentions = getMentions(messageEntity.message)
        .map((m) => m.getAttribute(MENTION_ID_ATTRIBUTE))
        .filter((id) => id !== undefined);
    return;
  }

  if (messageEntity.type === MessageType.Message && messageEntity.message) {
    messageEntity.linkPreviewResponse = await getLinkPreviewResponse(messageEntity.message);
    messageEntity.mentions = getMentions(messageEntity.message)
      .map((mention) => mention.getAttribute(MENTION_ID_ATTRIBUTE))
      .filter((id) => id !== undefined);
  }
};
