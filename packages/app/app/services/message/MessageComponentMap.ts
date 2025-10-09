import type { MessageEntity, User } from "@esposter/db";
import type { Component } from "vue";

import { MessageType } from "@esposter/db/src/models/message/MessageType";

export interface MessageComponentProps {
  active?: boolean;
  creator: User;
  isPreview?: boolean;
  message: MessageEntity;
}

export const MessageComponentMap = {
  [MessageType.EditRoom]: defineAsyncComponent(() => import("@/components/Message/Model/Message/Type/EditRoom.vue")),
  [MessageType.Message]: defineAsyncComponent(() => import("@/components/Message/Model/Message/Type/Index.vue")),
  [MessageType.PinMessage]: defineAsyncComponent(
    () => import("@/components/Message/Model/Message/Type/PinMessage.vue"),
  ),
  [MessageType.Webhook]: defineAsyncComponent(() => import("@/components/Message/Model/Message/Type/Index.vue")),
} as const satisfies Record<MessageType, Component>;
