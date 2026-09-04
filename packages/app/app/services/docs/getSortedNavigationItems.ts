import type { ContentNavigationItem } from "@nuxt/content";

import { DocsNavigationSlugs } from "@/models/docs/DocsNavigationSlug";
import { DEFAULT_DOCS_NAVIGATION_WEIGHT } from "@/services/docs/constants";
import { getSlug } from "@/services/docs/getSlug";

const getWeight = ({ path }: ContentNavigationItem) => {
  const index = DocsNavigationSlugs.indexOf(getSlug(path));
  return index === -1 ? DEFAULT_DOCS_NAVIGATION_WEIGHT : index;
};

export const getSortedNavigationItems = (items: ContentNavigationItem[]): ContentNavigationItem[] =>
  items
    .map((item) => (item.children ? { ...item, children: getSortedNavigationItems(item.children) } : item))
    .toSorted(
      (firstItem, secondItem) =>
        getWeight(firstItem) - getWeight(secondItem) || (firstItem.title ?? "").localeCompare(secondItem.title ?? ""),
    );
