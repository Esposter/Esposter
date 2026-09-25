// @unocss-include
/* eslint-disable perfectionist/sort-objects -- declaration order is the settings nav order */
import type { Item } from "@/models/shared/Item";
import type { Except } from "type-fest";

import { SettingsType } from "@/models/message/room/SettingsType";

export const SettingsListItemMap: Record<SettingsType, Except<Extract<Item, { icon: string }>, "onClick" | "title">> = {
  [SettingsType.Overview]: { icon: "i-mdi:information-outline" },
  [SettingsType.Roles]: { icon: "i-mdi:shield-key-outline" },
  [SettingsType.Profile]: { icon: "i-mdi:account-circle-outline" },
  [SettingsType.Emojis]: { icon: "i-mdi:emoticon-plus-outline" },
  [SettingsType.Webhooks]: { icon: "i-mdi:webhook" },
  [SettingsType.WordFilter]: { icon: "i-mdi:filter-outline" },
  [SettingsType.AuditLog]: { icon: "i-mdi:clipboard-list-outline" },
  [SettingsType.Bans]: { icon: "i-mdi:account-cancel-outline" },
  [SettingsType.Attachments]: { icon: "i-mdi:paperclip" },
  [SettingsType.Members]: { icon: "i-mdi:account-multiple-outline" },
  [SettingsType.Invites]: { icon: "i-mdi:account-plus-outline" },
  [SettingsType.Delete]: { color: "error", icon: "i-mdi:trash-can-outline" },
};
