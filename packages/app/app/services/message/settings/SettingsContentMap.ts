import { SettingsType } from "@/models/message/room/SettingsType";

export const SettingsContentMap = {
  [SettingsType.Webhook]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Webhook/Index.vue"),
  ),
} as const satisfies Record<SettingsType, Component>;
