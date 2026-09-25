import type { ResourceSearchItem } from "@/models/resource/search/ResourceSearchItem";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { CreatableResourceTypes } from "@/models/resource/CreatableResourceType";
import { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import { ResourceTypeDescriptionMap } from "@/services/resource/ResourceTypeDescriptionMap";
import { searchItems } from "@/services/search/searchItems";
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
