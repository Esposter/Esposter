import type { User } from "#shared/db/schema/users";
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";
import type { Component } from "vue";

import { MessageType } from "#shared/models/db/message/MessageType";

export interface MessageComponentProps {
  active?: boolean;
  creator: User;
  isPreview?: boolean;
  message: MessageEntity;
}

export const MessageComponentMap = {
  [MessageType.EditRoom]: defineAsyncComponent(() => import("@/components/Message/Model/Message/Type/EditRoom.vue")),
  [MessageType.Message]: defineAsyncComponent(() => import("@/components/Message/Model/Message/Type/Index.vue")),
} as const satisfies Record<MessageType, Component>;
