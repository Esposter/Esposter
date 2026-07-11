import type { ContentNavigationItem } from "@nuxt/content";

import { getNavigationGroups } from "@/services/docs/getNavigationGroups";

const flattenItems = (items: ContentNavigationItem[]): ContentNavigationItem[] =>
  items.flatMap((item) => {
    if (!item.children || item.children.length === 0) return [item];
    const children = flattenItems(item.children.filter(({ path }) => path !== item.path));
    return item.page === false ? children : [item, ...children];
  });

// Flattens sections into the exact sidebar display order — section overview leads,
// Then its groups in getNavigationGroups order — so surround links walk the sidebar
export const getFlattenedNavigationPages = (sections: ContentNavigationItem[]): ContentNavigationItem[] =>
  sections.flatMap((section) => {
    const children = (section.children ?? []).filter(({ path }) => path !== section.path);
    const pages = getNavigationGroups(section.path, children).flatMap(({ items }) => flattenItems(items));
    return section.page === false ? pages : [section, ...pages];
  });
