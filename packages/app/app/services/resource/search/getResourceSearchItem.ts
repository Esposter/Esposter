import type { RecentResourceView } from "@/models/resource/search/RecentResourceView";
import type { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import type { ResourceSearchItem } from "@/models/resource/search/ResourceSearchItem";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { RoutePath } from "@esposter/shared";

// One row shape for both the Resources group (live rows) and the Recently viewed group (localStorage views)
export const getResourceSearchItem = (
  { id, name, type }: RecentResourceView,
  group: ResourceSearchGroup.RecentlyViewed | ResourceSearchGroup.Resources,
): ResourceSearchItem => ({
  group,
  icon: ResourceDefinitionMap[type].icon,
  id: `${group}-${id}`,
  subtitle: ResourceDefinitionMap[type].title,
  title: name,
  to: RoutePath.Resource(id),
});
