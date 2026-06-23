import { UserSettingsType } from "@/models/message/user/UserSettingsType";

export const UserSettingsContentMap = {
  [UserSettingsType.Keybinds]: defineAsyncComponent(
    () => import("@/components/Message/Model/User/Settings/Type/Keybinds/Index.vue"),
  ),
  [UserSettingsType.Notifications]: defineAsyncComponent(
    () => import("@/components/Message/Model/User/Settings/Type/Notifications/Index.vue"),
  ),
  [UserSettingsType.Voice]: defineAsyncComponent(
    () => import("@/components/Message/Model/User/Settings/Type/Voice/Index.vue"),
  ),
} as const satisfies Record<UserSettingsType, Component>;
