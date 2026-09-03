import type { DocsNavigationGroup } from "@/models/docs/DocsNavigationGroup";
import type { ContentNavigationItem } from "@nuxt/content";

import { DocsNavigationSlug } from "@/models/docs/DocsNavigationSlug";
import { DocsSectionGroupsMap } from "@/services/docs/DocsSectionGroupsMap";
import { getSlug } from "@/services/docs/getSlug";

const PLANNING_GROUP_TITLE = "Planning";
const planningSlugs = new Set<string>([
  DocsNavigationSlug.Deferred,
  DocsNavigationSlug.Rejected,
  DocsNavigationSlug.Roadmap,
]);

export const getNavigationGroups = (sectionPath: string, items: ContentNavigationItem[]): DocsNavigationGroup[] => {
  const sectionGroups = DocsSectionGroupsMap[getSlug(sectionPath)] ?? {};
  const slugGroupTitleMap = new Map<string, string>();
  for (const [title, slugs] of Object.entries(sectionGroups))
    for (const slug of slugs) slugGroupTitleMap.set(slug, title);

  const groupTitleItemsMap = new Map<string | undefined, ContentNavigationItem[]>();
  for (const item of items) {
    const slug = getSlug(item.path);
    const title = planningSlugs.has(slug) ? PLANNING_GROUP_TITLE : slugGroupTitleMap.get(slug);
    const groupItems = groupTitleItemsMap.get(title) ?? [];
    groupItems.push(item);
    groupTitleItemsMap.set(title, groupItems);
  }
  // Ungrouped pages lead, mapped groups follow in declaration order, planning pages always trail
  return [undefined, ...Object.keys(sectionGroups), PLANNING_GROUP_TITLE].flatMap((title) => {
    const groupItems = groupTitleItemsMap.get(title);
    return groupItems ? [{ items: groupItems, title }] : [];
  });
};
