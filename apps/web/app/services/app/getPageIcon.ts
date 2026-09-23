import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { ProductGroups } from "@/services/app/ProductGroups";
import { SecondaryPageLinkItems } from "@/services/app/SecondaryPageLinkItems";

// The icon of the product or secondary page at exactly this path; any other page, a room or a resource, has none
// And the dock draws its title's first letter instead
export const getPageIcon = (path: string) =>
  [...ProductGroups.flatMap(({ items }): readonly ListLinkItem[] => items), ...SecondaryPageLinkItems].find(
    ({ href }) => href === path,
  )?.icon;
