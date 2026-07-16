import type { ResourceType } from "@esposter/db-schema";

import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { ResourceEditorComponentMap } from "@/services/resource/ResourceEditorComponentMap";
// Overview always exists; Editor only for types with an inline editor; the rest are the type's own blades
export const isValidResourceBlade = (type: ResourceType, blade: string) => {
  if (blade === ResourceBladeType.Overview) return true;
  if (blade === ResourceBladeType.Editor) return Boolean(ResourceEditorComponentMap[type]);
  return ResourceBladeDefinitionMap[type].some(({ slug }) => slug === blade);
};
