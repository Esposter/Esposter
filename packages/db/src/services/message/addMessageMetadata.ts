import type { AzureUpdateEntity, MessageTypeEntityMap } from "@esposter/db-schema";

import { getLinkPreviewResponse } from "#src/services/message/getLinkPreviewResponse";
import { getMentionIds } from "#src/services/message/getMentionIds";
import { MessageType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const addMessageMetadata = async (
  messageEntity: AzureUpdateEntity<InstanceType<MessageTypeEntityMap[MessageType]>>,
  operation: Operation.Create | Operation.Update = Operation.Create,
) => {
  if (operation === Operation.Update) {
    messageEntity.isEdited = true;
    if (messageEntity.message !== undefined) messageEntity.mentions = getMentionIds(messageEntity.message);
    return;
  }

  if (messageEntity.type === MessageType.Message && messageEntity.message) {
    messageEntity.linkPreviewResponse = await getLinkPreviewResponse(messageEntity.message);
    messageEntity.mentions = getMentionIds(messageEntity.message);
  }
};
