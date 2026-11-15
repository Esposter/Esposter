import { UserSettingsType } from "#src/models/message/user/UserSettingsType";

export const UserSettingsContentMap = {
  [UserSettingsType.Account]: defineAsyncComponent(
    () => import("#src/components/Message/Model/User/Settings/Type/Account/Index.vue"),
  ),
  [UserSettingsType.Appearance]: defineAsyncComponent(
    () => import("#src/components/Message/Model/User/Settings/Type/Appearance/Index.vue"),
  ),
  [UserSettingsType.Keybinds]: defineAsyncComponent(
    () => import("#src/components/Message/Model/User/Settings/Type/Keybinds/Index.vue"),
  ),
  [UserSettingsType.Notifications]: defineAsyncComponent(
    () => import("#src/components/Message/Model/User/Settings/Type/Notifications/Index.vue"),
  ),
  [UserSettingsType.Voice]: defineAsyncComponent(
    () => import("#src/components/Message/Model/User/Settings/Type/Voice/Index.vue"),
  ),
} as const satisfies Record<UserSettingsType, Component>;
