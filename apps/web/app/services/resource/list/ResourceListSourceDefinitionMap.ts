// @unocss-include
import type { ResourceListSourceDefinition } from "@/models/resource/list/ResourceListSourceDefinition";

import { ResourceListItemPropertyNames } from "#shared/models/resource/ResourceListItem";
import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DEFAULT_RESOURCE_SORT_BY, LAST_ACCESSED_RESOURCE_SORT_BY } from "@/services/resource/constants";
import { RoutePath } from "@esposter/shared";

// Everything that differs between the list routes, in one place: a filter preset, a default sort, the copy an
// Empty view shows, and the route and icon the menu and the palette's search render.
// Favorites keeps the default updated-first order rather than starred-first — the star's own timestamp is not
// A column any list shows. Recent is the opposite case, so it pins the column it sorts by.
export const ResourceListSourceDefinitionMap: Record<ResourceListSource, ResourceListSourceDefinition> = {
  [ResourceListSource.All]: {
    emptyState: { description: "Create a resource and it will show up here.", title: "No resources yet" },
    filter: {},
    icon: "i-mdi:folder-multiple-outline",
    meaning: UiIconMeaning.Folder,
    sortBy: DEFAULT_RESOURCE_SORT_BY,
    title: "All",
    to: RoutePath.ResourceExplorerAll,
  },
  [ResourceListSource.Favorites]: {
    emptyState: { description: "Star a resource and it will show up here.", title: "No favorites yet" },
    filter: { isFavorite: true },
    icon: "i-mdi:star-outline",
    meaning: UiIconMeaning.Favorite,
    sortBy: DEFAULT_RESOURCE_SORT_BY,
    title: "Favorites",
    to: RoutePath.ResourceExplorerFavorites,
  },
  [ResourceListSource.Recents]: {
    emptyState: { description: "Open a resource and it will show up here.", title: "No recent resources" },
    filter: { isAccessed: true },
    icon: "i-mdi:history",
    meaning: UiIconMeaning.Recent,
    pinnedColumnKey: ResourceListItemPropertyNames.lastAccessedAt,
    sortBy: LAST_ACCESSED_RESOURCE_SORT_BY,
    title: "Recent",
    to: RoutePath.ResourceExplorerRecents,
  },
};
