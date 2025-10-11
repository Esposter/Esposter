/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import type { CreateMessageInput } from "@/models/message/CreateMessageInput";
import type { MessageEntityMap } from "@/models/message/MessageEntityMap";
import type { ServerCreateMessageInput } from "@/models/message/ServerCreateMessageInput";
import type { WebhookCreateMessageInput } from "@/models/message/WebhookCreateMessageInput";

import { BaseMessageEntity } from "@/models/message/BaseMessageEntity";
import { MessageType } from "@/models/message/MessageType";
import { WebhookMessageEntity } from "@/models/message/WebhookMessageEntity";
import { getReverseTickedTimestamp } from "@/services/azure/table/getReverseTickedTimestamp";

export const createMessageEntity = <T extends CreateMessageInput>(input: T): MessageEntityMap[T["type"]] => {
  const createdAt = new Date();
  if (input.type === MessageType.Webhook) {
    const { roomId, ...rest } = input as WebhookCreateMessageInput;
    return new WebhookMessageEntity({
      ...rest,
      createdAt,
      partitionKey: roomId,
      rowKey: getReverseTickedTimestamp(),
      updatedAt: createdAt,
    }) as MessageEntityMap[T["type"]];
  } else {
    const { roomId, ...rest } = input as ServerCreateMessageInput;
    return new BaseMessageEntity({
      ...rest,
      createdAt,
      partitionKey: roomId,
      rowKey: getReverseTickedTimestamp(),
      updatedAt: createdAt,
    }) as MessageEntityMap[T["type"]];
  }
};
