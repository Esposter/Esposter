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
  const createItem = (blade: string, icon: string, title: string, to: string) => ({
    icon,
    isActive: activeBlade === blade,
    title,
    to,
  });
  const results = [
    createItem(
      ResourceBladeType.Overview,
      "mdi-information-outline",
      ResourceBladeTitleMap[ResourceBladeType.Overview],
      RoutePath.Resource(resource.id),
    ),
  ];
  // The Editor blade only exists for types with an inline editor; blade-only types (Sheet/TodoList) skip it
  if (ResourceEditorComponentMap[resource.type])
    results.push(
      createItem(
        ResourceBladeType.Editor,
        ResourceDefinitionMap[resource.type].icon,
        ResourceBladeTitleMap[ResourceBladeType.Editor],
        `${RoutePath.Resource(resource.id)}/${ResourceBladeType.Editor}`,
      ),
    );
  // Activity is built-in for every type, and sits above the type's own blades like the portal's
  results.push(
    createItem(
      ResourceBladeType.Activity,
      "mdi-history",
      ResourceBladeTitleMap[ResourceBladeType.Activity],
      `${RoutePath.Resource(resource.id)}/${ResourceBladeType.Activity}`,
    ),
  );
  // Publish history is the first capability-conditional built-in blade — only publishable types have snapshots
  if (hasCapability(resource.type, "publishable"))
    results.push(
      createItem(
        ResourceBladeType.PublishHistory,
        "mdi-cloud-clock-outline",
        ResourceBladeTitleMap[ResourceBladeType.PublishHistory],
        `${RoutePath.Resource(resource.id)}/${ResourceBladeType.PublishHistory}`,
      ),
    );
  for (const { icon, slug, title } of ResourceBladeDefinitionMap[resource.type])
    results.push(createItem(slug, icon, title, `${RoutePath.Resource(resource.id)}/${slug}`));
  return results;
});
</script>

<template>
  <StyledCollapsibleNav :items label="blade menu" :storage-key="LocalStorageKey.IsResourceBladeNavCollapsed" />
</template>
