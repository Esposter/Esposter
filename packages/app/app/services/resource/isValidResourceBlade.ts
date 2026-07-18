import type { ResourceType } from "@esposter/db-schema";

import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { ResourceEditorComponentMap } from "@/services/resource/ResourceEditorComponentMap";
// Overview and Activity always exist; Editor only for types with an inline editor;
// The rest are the type's own blades
export const isValidResourceBlade = (type: ResourceType, blade: string) => {
  if (blade === ResourceBladeType.Overview || blade === ResourceBladeType.Activity) return true;
  if (blade === ResourceBladeType.Editor) return Boolean(ResourceEditorComponentMap[type]);
  return ResourceBladeDefinitionMap[type].some(({ slug }) => slug === blade);
};
