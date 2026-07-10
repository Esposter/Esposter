<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { ResourceBladeTitleMap } from "@/services/resource/ResourceBladeTitleMap";
import { ResourceEditorComponentMap } from "@/services/resource/ResourceEditorComponentMap";
import { RoutePath } from "@esposter/shared";

interface ResourceBladeNavProps {
  activeBlade: string;
  resource: Resource;
}

const { activeBlade, resource } = defineProps<ResourceBladeNavProps>();
// Titles collapse to an icon rail on mobile so the blade content keeps the width.
const { smAndDown } = useVDisplay();
const items = computed(() => {
  const results = [
    {
      blade: ResourceBladeType.Overview as string,
      icon: "mdi-information-outline",
      title: ResourceBladeTitleMap[ResourceBladeType.Overview],
      to: RoutePath.Resource(resource.id),
    },
  ];
  // The Editor blade only exists for types with an inline editor; blade-only types (File/TodoList) skip it
  if (ResourceEditorComponentMap[resource.type])
    results.push({
      blade: ResourceBladeType.Editor,
      icon: ResourceDefinitionMap[resource.type].icon,
      title: ResourceBladeTitleMap[ResourceBladeType.Editor],
      to: `${RoutePath.Resource(resource.id)}/${ResourceBladeType.Editor}`,
    });
  for (const { icon, slug, title } of ResourceBladeDefinitionMap[resource.type])
    results.push({ blade: slug, icon, title, to: `${RoutePath.Resource(resource.id)}/${slug}` });
  return results;
});
</script>

<template>
  <v-list nav>
    <v-list-item
      v-for="item in items"
      :key="item.blade"
      :active="activeBlade === item.blade"
      :prepend-icon="item.icon"
      :title="smAndDown ? undefined : item.title"
      :to="item.to"
    />
  </v-list>
</template>
