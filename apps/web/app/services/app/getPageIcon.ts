import { getPageLinkItem } from "@/services/app/getPageLinkItem";
import { getSectionIcon } from "@/services/docs/getSectionIcon";
import { RoutePath } from "@esposter/shared";

// A place's icon: a product's, secondary page's or the settings' own, and a docs page takes its section's, since every
// Section has one. Any other page, a room or a resource, has none, and the dock draws its title's first letter so two
// Of them side by side stay told apart
export const getPageIcon = (path: string) => {
  const pageLinkItem = getPageLinkItem(path);
  if (pageLinkItem) return pageLinkItem.icon;
  const [, area, section] = path.split("/");
  return `/${area}` === RoutePath.Docs && section ? getSectionIcon(`${RoutePath.Docs}/${section}`) : undefined;
};
