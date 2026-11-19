import type { ResourceSearchItem } from "#src/models/resource/search/ResourceSearchItem";

import { ResourceListSources } from "#src/models/resource/list/ResourceListSource";
import { ResourceSearchGroup } from "#src/models/resource/search/ResourceSearchGroup";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { ResourceListSourceDefinitionMap } from "#src/services/resource/list/ResourceListSourceDefinitionMap";
import { ResourceListSourceSearchTitleMap } from "#src/services/resource/search/ResourceListSourceSearchTitleMap";
import { ID_SEPARATOR, RoutePath } from "@esposter/shared";

// The list routes come from the source registry so a new source is searchable without being listed twice
export const PageSearchItems: readonly ResourceSearchItem[] = [
  {
    group: ResourceSearchGroup.Pages,
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}home`,
    meaning: UiIconMeaning.Home,
    title: "Home",
    to: RoutePath.ResourceExplorer,
  },
  ...ResourceListSources.map((source) => ({
    group: ResourceSearchGroup.Pages,
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}${source}`,
    meaning: ResourceListSourceDefinitionMap[source].meaning,
    title: ResourceListSourceSearchTitleMap[source],
    to: ResourceListSourceDefinitionMap[source].to,
  })),
  {
    group: ResourceSearchGroup.Pages,
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}tags`,
    meaning: UiIconMeaning.Tag,
    title: "Tags",
    to: RoutePath.ResourceExplorerTags,
  },
  {
    group: ResourceSearchGroup.Pages,
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}recycle-bin`,
    meaning: UiIconMeaning.Delete,
    title: "Recycle bin",
    to: RoutePath.ResourceExplorerRecycleBin,
  },
  {
    group: ResourceSearchGroup.Pages,
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}create-a-resource`,
    meaning: UiIconMeaning.Create,
    title: "Create a resource",
    to: RoutePath.ResourceExplorerCreate,
  },
];
