import { SettingsType } from "#src/models/message/room/SettingsType";

export const SettingsContentMap = {
  [SettingsType.Attachments]: defineAsyncComponent(
    () => import("#src/components/Message/Model/Room/Settings/Type/Attachments/Index.vue"),
  ),
  [SettingsType.AuditLog]: defineAsyncComponent(
    () => import("#src/components/Message/Model/Room/Settings/Type/AuditLog/Index.vue"),
  ),
  [SettingsType.Bans]: defineAsyncComponent(
    () => import("#src/components/Message/Model/Room/Settings/Type/Bans/Index.vue"),
  ),
  [SettingsType.Emojis]: defineAsyncComponent(
    () => import("#src/components/Message/Model/Room/Settings/Type/Emoji/Index.vue"),
  ),
  [SettingsType.Invites]: defineAsyncComponent(
    () => import("#src/components/Message/Model/Room/Settings/Type/Invite/Index.vue"),
  ),
  [SettingsType.Members]: defineAsyncComponent(
    () => import("#src/components/Message/Model/Room/Settings/Type/Member/Index.vue"),
  ),
  [SettingsType.Overview]: defineAsyncComponent(
    () => import("#src/components/Message/Model/Room/Settings/Type/Overview/Index.vue"),
  ),
  [SettingsType.Profile]: defineAsyncComponent(
    () => import("#src/components/Message/Model/Room/Settings/Type/Profile/Index.vue"),
  ),
  [SettingsType.Roles]: defineAsyncComponent(
    () => import("#src/components/Message/Model/Room/Settings/Type/Role/Index.vue"),
  ),
  [SettingsType.Webhooks]: defineAsyncComponent(
    () => import("#src/components/Message/Model/Room/Settings/Type/Webhook/Index.vue"),
  ),
  [SettingsType.WordFilter]: defineAsyncComponent(
    () => import("#src/components/Message/Model/Room/Settings/Type/WordFilter/Index.vue"),
  ),
} as const satisfies Record<Exclude<SettingsType, typeof SettingsType.Delete>, Component>;
