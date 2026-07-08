import type { BladeDefinition } from "@/models/resource/BladeDefinition";

import { ResourceType } from "@esposter/db-schema";
// Type editors still live on their own top-level pages until the roadmap Phase 3-5 blade migration, so every
// Type starts with no blades beyond the generic Overview the resource page always renders first.
export const ResourceBladeDefinitionMap: Record<ResourceType, BladeDefinition[]> = {
  [ResourceType.Dashboard]: [],
  [ResourceType.Email]: [],
  [ResourceType.File]: [],
  [ResourceType.Flowchart]: [],
  [ResourceType.Survey]: [],
  [ResourceType.Table]: [],
  [ResourceType.TodoList]: [],
  [ResourceType.Webpage]: [],
};
