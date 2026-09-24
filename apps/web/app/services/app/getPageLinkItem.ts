import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { ProductGroups } from "@/services/app/ProductGroups";
import { SecondaryPageLinkItems } from "@/services/app/SecondaryPageLinkItems";
import { UserSettingsPageLinkItem } from "@/services/app/UserSettingsPageLinkItem";

// The product, secondary or settings page at exactly this path, whose icon and name stand for it; any other page, a room or a
// Resource, has none, and the dock draws its title's first letter instead
export const getPageLinkItem = (path: string) =>
  [
    ...ProductGroups.flatMap(({ items }): readonly ListLinkItem[] => items),
    ...SecondaryPageLinkItems,
    UserSettingsPageLinkItem,
  ].find(({ href }) => href === path);
