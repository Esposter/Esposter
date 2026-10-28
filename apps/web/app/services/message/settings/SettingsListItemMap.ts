// @unocss-include
import type { Item } from "@/models/shared/Item";
import type { Except } from "type-fest";

import { SettingsType } from "@/models/message/room/SettingsType";

export const SettingsListItemMap: Record<SettingsType, Except<Extract<Item, { icon: string }>, "onClick" | "title">> = {
  [SettingsType.Attachments]: { icon: "i-mdi:paperclip" },
  [SettingsType.AuditLog]: { icon: "i-mdi:clipboard-list-outline" },
  [SettingsType.Bans]: { icon: "i-mdi:account-cancel-outline" },
  [SettingsType.Delete]: { icon: "i-mdi:trash-can-outline" },
  [SettingsType.Emojis]: { icon: "i-mdi:emoticon-plus-outline" },
  [SettingsType.Invites]: { icon: "i-mdi:account-plus-outline" },
  [SettingsType.Members]: { icon: "i-mdi:account-multiple-outline" },
  [SettingsType.Overview]: { icon: "i-mdi:information-outline" },
  [SettingsType.Profile]: { icon: "i-mdi:account-circle-outline" },
  [SettingsType.Roles]: { icon: "i-mdi:shield-key-outline" },
  [SettingsType.Webhooks]: { icon: "i-mdi:webhook" },
  [SettingsType.WordFilter]: { icon: "i-mdi:filter-outline" },
};
