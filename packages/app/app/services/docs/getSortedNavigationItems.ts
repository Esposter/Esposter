import type { ContentNavigationItem } from "@nuxt/content";

import { DocsNavigationSlugs } from "@/models/docs/DocsNavigationSlug";
import { DEFAULT_DOCS_NAVIGATION_WEIGHT } from "@/services/docs/constants";

const getWeight = ({ path }: ContentNavigationItem) => {
  const slug = path.split("/").at(-1) ?? "";
  const index = DocsNavigationSlugs.findIndex((navigationSlug) => navigationSlug === slug);
  return index === -1 ? DEFAULT_DOCS_NAVIGATION_WEIGHT : index;
};

export const getSortedNavigationItems = (items: ContentNavigationItem[]): ContentNavigationItem[] =>
  items
    .map((item) => (item.children ? { ...item, children: getSortedNavigationItems(item.children) } : item))
    .toSorted((a, b) => getWeight(a) - getWeight(b) || (a.title ?? "").localeCompare(b.title ?? ""));
