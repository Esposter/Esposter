// @unocss-include
import type { BladeDefinition } from "@/models/resource/BladeDefinition";
import type { ResourceType } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { BuiltInBladeDefinitionMap } from "@/services/resource/BuiltInBladeDefinitionMap";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { ResourceEditorComponentMap } from "@/services/resource/ResourceEditorComponentMap";

// Which blades a type has, in nav order — the one answer to that question. The built-ins render through the
// Outlet's own branches rather than a component here, so the shape is the definition minus its component.
// Overview and Activity are unconditional; Editor exists only for types with an inline editor. Version history
// Is a panel opened from the action bar rather than a blade, because every type has revisions and a nav entry
// Every type carries is a nav entry that says nothing. The type's own blades come last.
export const getResourceBladeDefinitions = (type: ResourceType): Except<BladeDefinition, "component">[] => {
  const bladeDefinitions: Except<BladeDefinition, "component">[] = [
    { ...BuiltInBladeDefinitionMap[ResourceBladeType.Overview], slug: ResourceBladeType.Overview },
  ];
  // Blade-only types (Sheet/TodoList) have no inline editor, so their nav skips the Editor blade entirely
  if (ResourceEditorComponentMap[type])
    bladeDefinitions.push({
      ...BuiltInBladeDefinitionMap[ResourceBladeType.Editor],
      icon: ResourceDefinitionMap[type].icon,
      slug: ResourceBladeType.Editor,
    });
  // Activity is built-in for every type, and sits above the type's own blades like the portal's
  bladeDefinitions.push({ ...BuiltInBladeDefinitionMap[ResourceBladeType.Activity], slug: ResourceBladeType.Activity });
  for (const { icon, slug, title } of ResourceBladeDefinitionMap[type]) bladeDefinitions.push({ icon, slug, title });
  return bladeDefinitions;
};
