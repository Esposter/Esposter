import type { ResourceSearchItem } from "@/models/resource/search/ResourceSearchItem";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import { CreatableResourceTypes } from "@/services/resource/CreatableResourceTypes";
import { ResourceTypeDescriptionMap } from "@/services/resource/ResourceTypeDescriptionMap";
import { ID_SEPARATOR, RoutePath } from "@esposter/shared";

// Client-side substring match over the type registry — a registry this small justifies neither server work
// Nor a fuzzy library
export const getServiceSearchItems = (searchQuery: string): ResourceSearchItem[] => {
  const query = searchQuery.toLowerCase();
  return CreatableResourceTypes.filter(
    (type) =>
      ResourceDefinitionMap[type].title.toLowerCase().includes(query) ||
      ResourceTypeDescriptionMap[type].toLowerCase().includes(query),
  ).map((type) => ({
    createTo: RoutePath.ResourceExplorerCreateType(type),
    group: ResourceSearchGroup.Services,
    icon: ResourceDefinitionMap[type].icon,
    id: `${ResourceSearchGroup.Services}${ID_SEPARATOR}${type}`,
    subtitle: ResourceTypeDescriptionMap[type],
    title: ResourceDefinitionMap[type].title,
    to: { path: RoutePath.ResourceExplorerAll, query: { types: type } },
  }));
};
