/* eslint-disable perfectionist/sort-objects */
import type { Item } from "@/models/shared/Item";
import type { Except } from "type-fest";

import { UserSettingsType } from "@/models/message/user/UserSettingsType";

export const UserSettingsListItemMap: Record<UserSettingsType, Except<Item, "onClick" | "title">> = {
  [UserSettingsType.Account]: {
    icon: "mdi-account-circle-outline",
  },
  [UserSettingsType.Profile]: {
    icon: "mdi-card-account-details-outline",
  },
  [UserSettingsType.Voice]: {
    icon: "mdi-microphone-outline",
  },
  [UserSettingsType.Notifications]: {
    icon: "mdi-bell-outline",
  },
  [UserSettingsType.Appearance]: {
    icon: "mdi-palette-outline",
  },
  [UserSettingsType.Keybinds]: {
    icon: "mdi-keyboard-outline",
  },
};
