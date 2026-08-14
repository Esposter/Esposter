import type { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import type { ResourceSearchItem } from "@/models/resource/search/ResourceSearchItem";
import type { Resource } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { COMPOSITE_KEY_SEPARATOR } from "@/services/shared/constants";
import { RoutePath } from "@esposter/shared";

// One row shape for both the Resources group and the Recently opened group — both are live rows now
export const getResourceSearchItem = (
  { id, name, type }: Pick<Resource, "id" | "name" | "type">,
  group: ResourceSearchGroup.RecentlyOpened | ResourceSearchGroup.Resources,
): ResourceSearchItem => ({
  group,
  icon: ResourceDefinitionMap[type].icon,
  id: `${group}${COMPOSITE_KEY_SEPARATOR}${id}`,
  subtitle: ResourceDefinitionMap[type].title,
  title: name,
  to: RoutePath.Resource(id),
});
