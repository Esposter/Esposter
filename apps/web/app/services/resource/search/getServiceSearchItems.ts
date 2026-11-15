import type { ResourceSearchItem } from "#src/models/resource/search/ResourceSearchItem";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { CreatableResourceTypes } from "#src/models/resource/CreatableResourceType";
import { ResourceSearchGroup } from "#src/models/resource/search/ResourceSearchGroup";
import { ResourceTypeDescriptionMap } from "#src/services/resource/ResourceTypeDescriptionMap";
import { searchItems } from "#src/services/search/searchItems";
import { ID_SEPARATOR, RoutePath } from "@esposter/shared";

export const getServiceSearchItems = (searchQuery: string): ResourceSearchItem[] =>
  searchItems(
    CreatableResourceTypes,
    searchQuery,
    (type) => ({ description: ResourceTypeDescriptionMap[type], title: ResourceDefinitionMap[type].title }),
    { title: 2 },
  ).map((type) => ({
    createTo: RoutePath.ResourceExplorerCreateType(type),
    group: ResourceSearchGroup.Services,
    icon: ResourceDefinitionMap[type].icon,
    id: `${ResourceSearchGroup.Services}${ID_SEPARATOR}${type}`,
    subtitle: ResourceTypeDescriptionMap[type],
    title: ResourceDefinitionMap[type].title,
    to: { path: RoutePath.ResourceExplorerAll, query: { types: type } },
  }));
