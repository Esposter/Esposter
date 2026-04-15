import { SettingsType } from "@/models/message/room/SettingsType";

export const SettingsContentMap: Partial<Record<SettingsType, Component>> = {
  [SettingsType.Overview]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Overview/Index.vue"),
  ),
  [SettingsType.Permissions]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Permissions/Index.vue"),
  ),
  [SettingsType.Webhooks]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Webhook/Index.vue"),
  ),
};
