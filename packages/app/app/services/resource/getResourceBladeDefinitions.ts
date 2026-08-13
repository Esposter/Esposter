import type { BladeDefinition } from "@/models/resource/BladeDefinition";
import type { ResourceType } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { hasCapability } from "#shared/services/resource/hasCapability";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { ResourceEditorComponentMap } from "@/services/resource/ResourceEditorComponentMap";

// How each built-in blade presents itself, in one entry per blade. Editor is the exception that declares no
// Icon: it renders the type's own editor, so it wears the type's own icon rather than one of its own
const BuiltInBladeDefinitionMap = {
  [ResourceBladeType.Activity]: { icon: "mdi-history", title: "Activity" },
  [ResourceBladeType.Editor]: { title: "Editor" },
  [ResourceBladeType.Overview]: { icon: "mdi-information-outline", title: "Overview" },
  [ResourceBladeType.PublishHistory]: { icon: "mdi-cloud-clock-outline", title: "Publish history" },
} as const satisfies Record<ResourceBladeType, { icon?: string; title: string }>;
// Which blades a type has, in nav order — the one answer to that question. The built-ins render through the
// Outlet's own branches rather than a component here, so the shape is the definition minus its component.
// Overview and Activity are unconditional; Editor exists only for types with an inline editor, and Publish
// History only for publishable ones. The type's own blades come last.
export const getResourceBladeDefinitions = (type: ResourceType): Except<BladeDefinition, "component">[] => {
  const results: Except<BladeDefinition, "component">[] = [
    { ...BuiltInBladeDefinitionMap[ResourceBladeType.Overview], slug: ResourceBladeType.Overview },
  ];
  // Blade-only types (Sheet/TodoList) have no inline editor, so their nav skips the Editor blade entirely
  if (ResourceEditorComponentMap[type])
    results.push({
      ...BuiltInBladeDefinitionMap[ResourceBladeType.Editor],
      icon: ResourceDefinitionMap[type].icon,
      slug: ResourceBladeType.Editor,
    });
  // Activity is built-in for every type, and sits above the type's own blades like the portal's
  results.push({ ...BuiltInBladeDefinitionMap[ResourceBladeType.Activity], slug: ResourceBladeType.Activity });
  // Only publishable types have snapshots to show a history of
  if (hasCapability(type, "publishable"))
    results.push({
      ...BuiltInBladeDefinitionMap[ResourceBladeType.PublishHistory],
      slug: ResourceBladeType.PublishHistory,
    });
  for (const { icon, slug, title } of ResourceBladeDefinitionMap[type]) results.push({ icon, slug, title });
  return results;
};
