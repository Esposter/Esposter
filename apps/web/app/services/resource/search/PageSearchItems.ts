// @unocss-include
import type { ResourceSearchItem } from "@/models/resource/search/ResourceSearchItem";

import { ResourceListSources } from "@/models/resource/list/ResourceListSource";
import { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";
import { ResourceListSourceSearchTitleMap } from "@/services/resource/search/ResourceListSourceSearchTitleMap";
import { ID_SEPARATOR, RoutePath } from "@esposter/shared";

// The list routes come from the source registry so a new source is searchable without being listed twice
export const PageSearchItems: readonly ResourceSearchItem[] = [
  {
    group: ResourceSearchGroup.Pages,
    icon: "i-mdi:home-outline",
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}home`,
    title: "Home",
    to: RoutePath.ResourceExplorer,
  },
  ...ResourceListSources.map((source) => ({
    group: ResourceSearchGroup.Pages,
    icon: ResourceListSourceDefinitionMap[source].icon,
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}${source}`,
    title: ResourceListSourceSearchTitleMap[source],
    to: ResourceListSourceDefinitionMap[source].to,
  })),
  {
    group: ResourceSearchGroup.Pages,
    icon: "i-mdi:tag-multiple-outline",
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}tags`,
    title: "Tags",
    to: RoutePath.ResourceExplorerTags,
  },
  {
    group: ResourceSearchGroup.Pages,
    icon: "i-mdi:delete-outline",
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}recycle-bin`,
    title: "Recycle bin",
    to: RoutePath.ResourceExplorerRecycleBin,
  },
  {
    group: ResourceSearchGroup.Pages,
    icon: "i-mdi:plus-box-outline",
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}create-a-resource`,
    title: "Create a resource",
    to: RoutePath.ResourceExplorerCreate,
  },
];
