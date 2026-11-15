import type { PageLink } from "#shared/models/app/PageLink";

import { PageMarkType } from "#shared/models/app/PageMarkType";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getPageLinkItem } from "#src/services/app/getPageLinkItem";

// Declared rather than inferred: an inferred union gives every member every key, so a check on one key narrows nothing
type PageIcon = undefined | { icon: string } | { meaning: UiIconMeaning };

// A place's icon: a product's, secondary page's or the settings' own, as a class, or a meaning the dock draws in the
// Reader's style. A page its path says nothing about takes its mark's, a resource its type's class and a room the room
// Meaning, and one with no mark has none, so the dock draws its title's first letter and two of them stay told apart
export const getPageIcon = ({ mark, path }: Pick<PageLink, "mark" | "path">): PageIcon => {
  const pageLinkItem = getPageLinkItem(path);
  if (pageLinkItem) return { icon: pageLinkItem.icon };
  else if (!mark) return undefined;
  else if (mark.type === PageMarkType.Room) return { meaning: UiIconMeaning.Comment };
  else return { icon: ResourceDefinitionMap[mark.resourceType].icon };
};
