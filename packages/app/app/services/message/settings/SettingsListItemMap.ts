/* eslint-disable perfectionist/sort-objects */
import type { Item } from "@/models/shared/Item";
import type { Except } from "type-fest";

import { SettingsType } from "@/models/message/room/SettingsType";

export const SettingsListItemMap: Record<SettingsType, Except<Item, "onClick" | "title">> = {
  [SettingsType.Overview]: {
    icon: "mdi-information-outline",
  },
  [SettingsType.Roles]: {
    icon: "mdi-shield-key-outline",
  },
  [SettingsType.Profile]: {
    icon: "mdi-account-circle-outline",
  },
  [SettingsType.Webhooks]: {
    icon: "mdi-webhook",
  },
  [SettingsType.WordFilter]: {
    icon: "mdi-filter-outline",
  },
  [SettingsType.AuditLog]: {
    icon: "mdi-clipboard-list-outline",
  },
  [SettingsType.Bans]: {
    icon: "mdi-account-cancel-outline",
  },
  [SettingsType.Attachments]: {
    icon: "mdi-paperclip",
  },
  [SettingsType.Members]: {
    icon: "mdi-account-multiple-outline",
  },
  [SettingsType.Invites]: {
    icon: "mdi-account-plus-outline",
  },
  [SettingsType.Delete]: {
    color: "error",
    icon: "mdi-trash-can-outline",
  },
};
