import type { Creator } from "@/models/message/Creator";
import type { MessageEntity } from "@esposter/db-schema";
import type { Component } from "vue";

import { MessageType } from "@esposter/db-schema";

export interface MessageComponentProps<T extends MessageEntity = MessageEntity> {
  active?: boolean;
  creator: Creator;
  isPreview?: boolean;
  isSameBatch?: boolean;
  message: T;
}

export const MessageComponentMap = {
  [MessageType.EditRoom]: defineAsyncComponent(() => import("@/components/Message/Model/Message/Type/EditRoom.vue")),
  [MessageType.Message]: defineAsyncComponent(() => import("@/components/Message/Model/Message/Type/Index.vue")),
  [MessageType.PinMessage]: defineAsyncComponent(
    () => import("@/components/Message/Model/Message/Type/PinMessage.vue"),
  ),
  [MessageType.Webhook]: defineAsyncComponent(() => import("@/components/Message/Model/Message/Type/Index.vue")),
} as const satisfies Record<MessageType, Component>;
