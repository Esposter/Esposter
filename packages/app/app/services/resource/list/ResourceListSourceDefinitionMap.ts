import type { ResourceListSourceDefinition } from "@/models/resource/list/ResourceListSourceDefinition";

import { ResourceListItemPropertyNames } from "#shared/models/resource/ResourceListItem";
import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { DEFAULT_RESOURCE_SORT_BY, LAST_ACCESSED_RESOURCE_SORT_BY } from "@/services/resource/constants";

// Favorites deliberately keeps the default updated-first order rather than starred-first: the star's own
// Timestamp is not a column any list shows, and a list ordered by a value the reader cannot see is a list
// Whose order looks arbitrary. Recent is the opposite case — it pins the column it sorts by.
export const ResourceListSourceDefinitionMap: Record<ResourceListSource, ResourceListSourceDefinition> = {
  [ResourceListSource.All]: {
    emptyState: {
      description: "Create a resource and it will show up here.",
      icon: "mdi-folder-multiple-outline",
      title: "No resources yet",
    },
    filter: {},
    icon: "mdi-folder-multiple-outline",
    sortBy: DEFAULT_RESOURCE_SORT_BY,
    title: "All",
  },
  [ResourceListSource.Favorites]: {
    emptyState: {
      description: "Star a resource and it will show up here.",
      icon: "mdi-star-outline",
      title: "No favorites yet",
    },
    filter: { isFavorite: true },
    icon: "mdi-star-outline",
    sortBy: DEFAULT_RESOURCE_SORT_BY,
    title: "Favorites",
  },
  [ResourceListSource.Recents]: {
    emptyState: {
      description: "Open a resource and it will show up here.",
      icon: "mdi-history",
      title: "No recent resources",
    },
    filter: { isAccessed: true },
    icon: "mdi-history",
    pinnedColumnKey: ResourceListItemPropertyNames.lastAccessedAt,
    sortBy: LAST_ACCESSED_RESOURCE_SORT_BY,
    title: "Recent",
  },
};
