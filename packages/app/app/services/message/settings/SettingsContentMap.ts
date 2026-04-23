import { SettingsType } from "@/models/message/room/SettingsType";

export const SettingsContentMap = {
  [SettingsType.Overview]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Overview/Index.vue"),
  ),
  [SettingsType.Permissions]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Permissions/Index.vue"),
  ),
  [SettingsType.Webhooks]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Webhook/Index.vue"),
  ),
  [SettingsType.Bans]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Bans/Index.vue"),
  ),
  [SettingsType.AuditLog]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/AuditLog/Index.vue"),
  ),
} as const satisfies Record<Exclude<SettingsType, SettingsType.Delete>, Component>;
