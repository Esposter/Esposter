/* eslint-disable perfectionist/sort-objects */
import type { Item } from "@/models/shared/Item";
import type { Except } from "type-fest";

import { SettingsType } from "@/models/message/room/SettingsType";

export const SettingsListItemMap: Record<SettingsType, Except<Item, "onClick" | "title">> = {
  [SettingsType.Overview]: {
    icon: "mdi-information-outline",
  },
  [SettingsType.Permissions]: {
    icon: "mdi-shield-key-outline",
  },
  [SettingsType.Webhooks]: {
    icon: "mdi-webhook",
  },
  [SettingsType.Bans]: {
    icon: "mdi-account-cancel-outline",
  },
  [SettingsType.AuditLog]: {
    icon: "mdi-clipboard-list-outline",
  },
  [SettingsType.Delete]: {
    color: "error",
    icon: "mdi-trash-can-outline",
  },
};
