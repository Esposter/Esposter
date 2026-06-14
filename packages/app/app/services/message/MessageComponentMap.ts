import { MessageType } from "@esposter/db-schema";

export const MessageComponentMap = {
  [MessageType.Call]: defineAsyncComponent(() => import("@/components/Message/Model/Message/Type/Call.vue")),
  [MessageType.EditRoom]: defineAsyncComponent(() => import("@/components/Message/Model/Message/Type/EditRoom.vue")),
  [MessageType.Message]: defineAsyncComponent(() => import("@/components/Message/Model/Message/Type/Index.vue")),
  [MessageType.PinMessage]: defineAsyncComponent(
    () => import("@/components/Message/Model/Message/Type/PinMessage.vue"),
  ),
  [MessageType.Poll]: defineAsyncComponent(() => import("@/components/Message/Model/Message/Type/Poll.vue")),
  [MessageType.System]: defineAsyncComponent(() => import("@/components/Message/Model/Message/Type/System.vue")),
  [MessageType.Webhook]: defineAsyncComponent(() => import("@/components/Message/Model/Message/Type/Index.vue")),
} as const satisfies Record<MessageType, Component>;
