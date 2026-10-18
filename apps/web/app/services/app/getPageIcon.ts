import type { PageLink } from "#shared/models/app/PageLink";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { getPageLinkItem } from "@/services/app/getPageLinkItem";

// A place's icon: a product's, secondary page's or the settings' own. A page its path says nothing about takes its
// Mark's, a resource its type's, and one with no mark, a Room, has none, so the dock draws its title's first letter
// And two of them side by side stay told apart
export const getPageIcon = ({ mark, path }: Pick<PageLink, "mark" | "path">) => {
  const pageLinkItem = getPageLinkItem(path);
  if (pageLinkItem) return pageLinkItem.icon;
  else if (mark) return ResourceDefinitionMap[mark.resourceType].icon;
  else return undefined;
};
