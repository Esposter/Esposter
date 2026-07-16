import type { ListItemCategoryDefinition } from "@/models/vuetify/ListItemCategoryDefinition";
import type { ResourceType } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceTypes } from "@esposter/db-schema";

export const ResourceTypeListItems: ListItemCategoryDefinition<ResourceType>[] = ResourceTypes.map((type) => ({
  icon: ResourceDefinitionMap[type].icon,
  title: ResourceDefinitionMap[type].title,
  value: type,
}));
