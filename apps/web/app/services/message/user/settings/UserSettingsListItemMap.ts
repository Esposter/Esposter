// @unocss-include
/* eslint-disable perfectionist/sort-objects */
import type { Item } from "@/models/shared/Item";
import type { Except } from "type-fest";

import { UserSettingsType } from "@/models/message/user/UserSettingsType";

export const UserSettingsListItemMap: Record<UserSettingsType, Except<Item, "onClick" | "title">> = {
  [UserSettingsType.Account]: { icon: "i-mdi:account-circle-outline" },
  [UserSettingsType.Appearance]: { icon: "i-mdi:palette-outline" },
  [UserSettingsType.Voice]: { icon: "i-mdi:microphone-outline" },
  [UserSettingsType.Notifications]: { icon: "i-mdi:bell-outline" },
  [UserSettingsType.Keybinds]: { icon: "i-mdi:keyboard-outline" },
};
