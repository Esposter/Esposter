import type { Item } from "@/models/shared/Item";
import type { Except } from "type-fest";

import { SettingsType } from "@/models/message/room/SettingsType";

export const SettingsListItemMap = {
  [SettingsType.Webhooks]: {
    icon: "mdi-webhook",
  },
} as const satisfies Record<SettingsType, Except<Item, "onClick" | "title">>;
