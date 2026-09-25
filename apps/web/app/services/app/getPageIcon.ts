import type { PageLink } from "#shared/models/app/PageLink";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { getPageLinkItem } from "@/services/app/getPageLinkItem";
import { getSectionIcon } from "@/services/docs/getSectionIcon";
import { RoutePath } from "@esposter/shared";

// A place's icon: a product's, secondary page's or the settings' own, and a docs page takes its section's, since every
// Section has one. A page its path says nothing about takes its mark's, a resource its type's, and one with no mark, a
// Room, has none, so the dock draws its title's first letter and two of them side by side stay told apart
export const getPageIcon = ({ mark, path }: Pick<PageLink, "mark" | "path">) => {
  const pageLinkItem = getPageLinkItem(path);
  if (pageLinkItem) return pageLinkItem.icon;
  const [, area, section] = path.split("/");
  if (`/${area}` === RoutePath.Docs && section) return getSectionIcon(`${RoutePath.Docs}/${section}`);
  else if (mark) return ResourceDefinitionMap[mark.resourceType].icon;
  else return undefined;
};
