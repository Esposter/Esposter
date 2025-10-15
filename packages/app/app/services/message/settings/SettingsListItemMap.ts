import type { Item } from "@/models/shared/Item";
import type { Except } from "type-fest";

import { SettingsType } from "@/models/message/settings/SettingsType";

export const SettingsListItemMap = {
  [SettingsType.Webhook]: {
    icon: "mdi-webhook",
  },
} as const satisfies Record<SettingsType, Except<Item, "onClick" | "title">>;
