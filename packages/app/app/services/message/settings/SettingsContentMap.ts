import { SettingsType } from "@/models/message/settings/SettingsType";

export const SettingsContentMap = {
  [SettingsType.Webhook]: defineAsyncComponent(
    () => import("@/components/Message/LeftSideBar/Settings/Type/Webhook/Index.vue"),
  ),
} as const satisfies Record<SettingsType, Component>;
