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
    meaning: UiIconMeaning.Home,
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}home`,
    title: "Home",
    to: RoutePath.ResourceExplorer,
  },
  ...ResourceListSources.map((source) => ({
    group: ResourceSearchGroup.Pages,
    meaning: ResourceListSourceDefinitionMap[source].meaning,
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}${source}`,
    title: ResourceListSourceSearchTitleMap[source],
    to: ResourceListSourceDefinitionMap[source].to,
  })),
  {
    group: ResourceSearchGroup.Pages,
    meaning: UiIconMeaning.Tag,
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}tags`,
    title: "Tags",
    to: RoutePath.ResourceExplorerTags,
  },
  {
    group: ResourceSearchGroup.Pages,
    meaning: UiIconMeaning.Delete,
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}recycle-bin`,
    title: "Recycle bin",
    to: RoutePath.ResourceExplorerRecycleBin,
  },
  {
    group: ResourceSearchGroup.Pages,
    meaning: UiIconMeaning.Create,
    id: `${ResourceSearchGroup.Pages}${ID_SEPARATOR}create-a-resource`,
    title: "Create a resource",
    to: RoutePath.ResourceExplorerCreate,
  },
];
