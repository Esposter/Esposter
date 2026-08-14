import type { ResourceSearchItem } from "@/models/resource/search/ResourceSearchItem";

import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";
import { COMPOSITE_KEY_SEPARATOR } from "@/services/shared/constants";
import { RoutePath } from "@esposter/shared";

// The list routes come from the source registry so a new source is searchable without being listed twice.
// Their titles are spelled out here rather than taken from the definition: the menu sits under a "Resources"
// Heading that supplies the noun, while a flat search result has to carry it — "Favorites" alone is ambiguous
const ResourceListSourceSearchTitleMap: Record<ResourceListSource, string> = {
  [ResourceListSource.All]: "All resources",
  [ResourceListSource.Favorites]: "Favorite resources",
  [ResourceListSource.Recents]: "Recent resources",
};

export const PageSearchItems: readonly ResourceSearchItem[] = [
  {
    group: ResourceSearchGroup.Pages,
    icon: "mdi-home-outline",
    id: `${ResourceSearchGroup.Pages}-home`,
    title: "Home",
    to: RoutePath.ResourceExplorer,
  },
  ...Object.values(ResourceListSource).map((source) => ({
    group: ResourceSearchGroup.Pages,
    icon: ResourceListSourceDefinitionMap[source].icon,
    id: `${ResourceSearchGroup.Pages}${COMPOSITE_KEY_SEPARATOR}${source}`,
    title: ResourceListSourceSearchTitleMap[source],
    to: ResourceListSourceDefinitionMap[source].to,
  })),
  {
    group: ResourceSearchGroup.Pages,
    icon: "mdi-tag-multiple-outline",
    id: `${ResourceSearchGroup.Pages}-tags`,
    title: "Tags",
    to: RoutePath.ResourceExplorerTags,
  },
  {
    group: ResourceSearchGroup.Pages,
    icon: "mdi-delete-outline",
    id: `${ResourceSearchGroup.Pages}-recycle-bin`,
    title: "Recycle bin",
    to: RoutePath.ResourceExplorerRecycleBin,
  },
  {
    group: ResourceSearchGroup.Pages,
    icon: "mdi-plus-box-outline",
    id: `${ResourceSearchGroup.Pages}-create-a-resource`,
    title: "Create a resource",
    to: RoutePath.ResourceExplorerCreate,
  },
];
