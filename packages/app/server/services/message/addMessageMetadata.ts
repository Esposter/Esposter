import type { AzureUpdateEntity } from "#shared/models/azure/AzureUpdateEntity";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { MessageType } from "#shared/models/db/message/MessageType";
import { MENTION_ID } from "#shared/services/message/constants";
import { getMentions } from "#shared/services/message/getMentions";
import { getLinkPreviewResponse } from "@@/server/services/message/getLinkPreviewResponse";
import { Operation } from "@esposter/shared";

export const addMessageMetadata = async (
  messageEntity: AzureUpdateEntity<MessageEntity>,
  operation: Operation.Create | Operation.Update = Operation.Create,
) => {
  if (messageEntity.type === MessageType.Message && messageEntity.message) {
    switch (operation) {
      case Operation.Create:
        messageEntity.linkPreviewResponse = await getLinkPreviewResponse(messageEntity.message);
        break;
      case Operation.Update:
        messageEntity.isEdited = true;
        break;
    }

    messageEntity.mentions = getMentions(messageEntity.message)
      .map((mention) => mention.getAttribute(MENTION_ID))
      .filter((id) => id !== undefined);
  }
};
