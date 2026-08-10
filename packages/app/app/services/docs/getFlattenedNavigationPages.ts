import type { ContentNavigationItem } from "@nuxt/content";

import { getChildNavigationItems } from "@/services/docs/getChildNavigationItems";
import { getNavigationGroups } from "@/services/docs/getNavigationGroups";

const flattenItems = (items: ContentNavigationItem[]): ContentNavigationItem[] =>
  items.flatMap((item) => {
    const children = flattenItems(getChildNavigationItems(item));
    if (children.length === 0) return [item];
    return item.page === false ? children : [item, ...children];
  });
// Flattens sections into the exact sidebar display order — section overview leads,
// Then its groups in getNavigationGroups order — so surround links walk the sidebar
export const getFlattenedNavigationPages = (sections: ContentNavigationItem[]): ContentNavigationItem[] =>
  sections.flatMap((section) => {
    const pages = getNavigationGroups(section.path, getChildNavigationItems(section)).flatMap(({ items }) =>
      flattenItems(items),
    );
    return section.page === false ? pages : [section, ...pages];
  });
