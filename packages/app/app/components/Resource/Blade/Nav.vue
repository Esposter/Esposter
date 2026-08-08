<script setup lang="ts">
import type { CollapsibleNavItem } from "@/models/shared/CollapsibleNavItem";
import type { Resource } from "@esposter/db-schema";

import { hasCapability } from "#shared/services/resource/hasCapability";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { ResourceBladeTitleMap } from "@/services/resource/ResourceBladeTitleMap";
import { ResourceEditorComponentMap } from "@/services/resource/ResourceEditorComponentMap";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { RoutePath } from "@esposter/shared";

interface ResourceBladeNavProps {
  activeBlade: string;
  resource: Resource;
}

const { activeBlade, resource } = defineProps<ResourceBladeNavProps>();
const items = computed<CollapsibleNavItem[]>(() => {
  const resourcePath = RoutePath.Resource(resource.id);
  const results = [
    {
      blade: ResourceBladeType.Overview as string,
      icon: "mdi-information-outline",
      title: ResourceBladeTitleMap[ResourceBladeType.Overview],
      to: resourcePath,
    },
  ];
  // The Editor blade only exists for types with an inline editor; blade-only types (Sheet/TodoList) skip it
  if (ResourceEditorComponentMap[resource.type])
    results.push({
      blade: ResourceBladeType.Editor,
      icon: ResourceDefinitionMap[resource.type].icon,
      title: ResourceBladeTitleMap[ResourceBladeType.Editor],
      to: `${resourcePath}/${ResourceBladeType.Editor}`,
    });
  // Activity is built-in for every type, and sits above the type's own blades like the portal's
  results.push({
    blade: ResourceBladeType.Activity,
    icon: "mdi-history",
    title: ResourceBladeTitleMap[ResourceBladeType.Activity],
    to: `${resourcePath}/${ResourceBladeType.Activity}`,
  });
  // Publish history is the first capability-conditional built-in blade — only publishable types have snapshots
  if (hasCapability(resource.type, "publishable"))
    results.push({
      blade: ResourceBladeType.PublishHistory,
      icon: "mdi-cloud-clock-outline",
      title: ResourceBladeTitleMap[ResourceBladeType.PublishHistory],
      to: `${resourcePath}/${ResourceBladeType.PublishHistory}`,
    });
  for (const { icon, slug, title } of ResourceBladeDefinitionMap[resource.type])
    results.push({ blade: slug, icon, title, to: `${resourcePath}/${slug}` });
  return results.map((item) => ({ ...item, isActive: activeBlade === item.blade }));
});
</script>

<template>
  <StyledCollapsibleNav
    :items
    hide-text="Hide blade menu"
    show-text="Show blade menu"
    :storage-key="LocalStorageKey.IsResourceBladeNavCollapsed"
  />
</template>
