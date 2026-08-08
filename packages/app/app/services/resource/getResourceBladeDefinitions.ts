import type { BladeDefinition } from "@/models/resource/BladeDefinition";
import type { ResourceType } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { hasCapability } from "#shared/services/resource/hasCapability";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { ResourceBladeTitleMap } from "@/services/resource/ResourceBladeTitleMap";
import { ResourceEditorComponentMap } from "@/services/resource/ResourceEditorComponentMap";

// Which blades a type has, in nav order — the one answer to that question. The built-ins render through the
// Outlet's own branches rather than a component here, so the shape is the definition minus its component.
// Overview and Activity are unconditional; Editor exists only for types with an inline editor, and Publish
// History only for publishable ones. The type's own blades come last.
export const getResourceBladeDefinitions = (type: ResourceType): Except<BladeDefinition, "component">[] => {
  const results = [
    {
      icon: "mdi-information-outline",
      slug: ResourceBladeType.Overview as string,
      title: ResourceBladeTitleMap[ResourceBladeType.Overview],
    },
  ];
  // Blade-only types (Sheet/TodoList) have no inline editor, so their nav skips the Editor blade entirely
  if (ResourceEditorComponentMap[type])
    results.push({
      icon: ResourceDefinitionMap[type].icon,
      slug: ResourceBladeType.Editor,
      title: ResourceBladeTitleMap[ResourceBladeType.Editor],
    });
  // Activity is built-in for every type, and sits above the type's own blades like the portal's
  results.push({
    icon: "mdi-history",
    slug: ResourceBladeType.Activity,
    title: ResourceBladeTitleMap[ResourceBladeType.Activity],
  });
  // Only publishable types have snapshots to show a history of
  if (hasCapability(type, "publishable"))
    results.push({
      icon: "mdi-cloud-clock-outline",
      slug: ResourceBladeType.PublishHistory,
      title: ResourceBladeTitleMap[ResourceBladeType.PublishHistory],
    });
  for (const { icon, slug, title } of ResourceBladeDefinitionMap[type]) results.push({ icon, slug, title });
  return results;
};
