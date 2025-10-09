import type { AzureUpdateEntity } from "#shared/models/azure/table/AzureUpdateEntity";
import type { MessageEntity } from "@esposter/db";

import { MENTION_ID_ATTRIBUTE } from "#shared/services/message/constants";
import { getMentions } from "#shared/services/message/getMentions";
import { getLinkPreviewResponse } from "@@/server/services/message/getLinkPreviewResponse";
import { MessageType } from "@esposter/db";
import { Operation } from "@esposter/shared";

export const addMessageMetadata = async (
  messageEntity: AzureUpdateEntity<MessageEntity>,
  operation: Operation.Create | Operation.Update = Operation.Create,
) => {
  if (operation === Operation.Update) {
    messageEntity.isEdited = true;
    if (messageEntity.message !== undefined)
      messageEntity.mentions = getMentions(messageEntity.message)
        .map((mention) => mention.getAttribute(MENTION_ID_ATTRIBUTE))
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
