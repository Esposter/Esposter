import { MessageType } from "@esposter/db-schema";

export const MessageComponentMap = {
  [MessageType.Call]: defineAsyncComponent(() => import("#src/components/Message/Model/Message/Type/Call.vue")),
  [MessageType.EditRoom]: defineAsyncComponent(() => import("#src/components/Message/Model/Message/Type/EditRoom.vue")),
  [MessageType.Message]: defineAsyncComponent(() => import("#src/components/Message/Model/Message/Type/Index.vue")),
  [MessageType.PinMessage]: defineAsyncComponent(
    () => import("#src/components/Message/Model/Message/Type/PinMessage.vue"),
  ),
  [MessageType.Poll]: defineAsyncComponent(() => import("#src/components/Message/Model/Message/Type/Poll.vue")),
  [MessageType.System]: defineAsyncComponent(() => import("#src/components/Message/Model/Message/Type/System.vue")),
  [MessageType.Webhook]: defineAsyncComponent(() => import("#src/components/Message/Model/Message/Type/Index.vue")),
} as const satisfies Record<MessageType, Component>;
