import { SettingsType } from "@/models/message/room/SettingsType";

export const SettingsContentMap = {
  [SettingsType.Attachments]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Attachments/Index.vue"),
  ),
  [SettingsType.AuditLog]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/AuditLog/Index.vue"),
  ),
  [SettingsType.Bans]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Bans/Index.vue"),
  ),
  [SettingsType.Emojis]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Emoji/Index.vue"),
  ),
  [SettingsType.Members]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Member/Index.vue"),
  ),
  [SettingsType.Overview]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Overview/Index.vue"),
  ),
  [SettingsType.Profile]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Profile/Index.vue"),
  ),
  [SettingsType.Roles]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Role/Index.vue"),
  ),
  [SettingsType.Webhooks]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/Webhook/Index.vue"),
  ),
  [SettingsType.WordFilter]: defineAsyncComponent(
    () => import("@/components/Message/Model/Room/Settings/Type/WordFilter/Index.vue"),
  ),
} as const satisfies Record<Exclude<SettingsType, SettingsType.Delete>, Component>;
