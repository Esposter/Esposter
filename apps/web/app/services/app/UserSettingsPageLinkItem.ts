// @unocss-include
import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { RoutePath } from "@esposter/shared";

// The reader's settings, which the account menu leads with and the dock names by this wherever it keeps the page
export const UserSettingsPageLinkItem = {
  href: RoutePath.UserSettings,
  icon: "i-mdi:cog",
  title: "Settings",
} as const satisfies ListLinkItem;
