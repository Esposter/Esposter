import { SettingsType } from "@/models/message/room/SettingsType";

export const SettingsContentMap = {
  [SettingsType.General]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/General/Index.vue"),
  ),
  [SettingsType.Webhooks]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Webhook/Index.vue"),
  ),
} as const satisfies Record<SettingsType, Component>;
