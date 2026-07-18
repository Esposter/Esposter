<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { hasCapability } from "#shared/services/resource/hasCapability";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { ResourceBladeTitleMap } from "@/services/resource/ResourceBladeTitleMap";
import { ResourceEditorComponentMap } from "@/services/resource/ResourceEditorComponentMap";
import { RoutePath, takeOne } from "@esposter/shared";

interface ResourceBladeNavProps {
  activeBlade: string;
  resource: Resource;
}

const { activeBlade, resource } = defineProps<ResourceBladeNavProps>();
// On mobile the rail collapses into a dropdown so the blade content keeps the full width.
const { smAndDown } = useVDisplay();
const isOpen = ref(false);
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
  // Activity is built-in for every type, and sits above the type's own blades like the portal's
  results.push({
    blade: ResourceBladeType.Activity,
    icon: "mdi-history",
    title: ResourceBladeTitleMap[ResourceBladeType.Activity],
    to: `${RoutePath.Resource(resource.id)}/${ResourceBladeType.Activity}`,
  });
  // Publish history is the first capability-conditional built-in blade — only publishable types have snapshots
  if (hasCapability(resource.type, "publishable"))
    results.push({
      blade: ResourceBladeType.PublishHistory,
      icon: "mdi-cloud-clock-outline",
      title: ResourceBladeTitleMap[ResourceBladeType.PublishHistory],
      to: `${RoutePath.Resource(resource.id)}/${ResourceBladeType.PublishHistory}`,
    });
  for (const { icon, slug, title } of ResourceBladeDefinitionMap[resource.type])
    results.push({ blade: slug, icon, title, to: `${RoutePath.Resource(resource.id)}/${slug}` });
  return results;
});
const activeItem = computed(() => items.value.find(({ blade }) => blade === activeBlade) ?? takeOne(items.value));
</script>

<template>
  <v-menu v-if="smAndDown" v-model="isOpen">
    <template #activator="{ props }">
      <v-list nav w-full>
        <v-list-item :="props" :prepend-icon="activeItem.icon" :title="activeItem.title">
          <template #append>
            <v-icon :icon="isOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'" />
          </template>
        </v-list-item>
      </v-list>
    </template>
    <v-list nav>
      <v-list-item
        v-for="item in items"
        :key="item.blade"
        link
        :active="activeBlade === item.blade"
        :prepend-icon="item.icon"
        :title="item.title"
        @click="navigateTo(item.to)"
      />
    </v-list>
  </v-menu>
  <v-list v-else nav>
    <v-list-item
      v-for="item in items"
      :key="item.blade"
      link
      :active="activeBlade === item.blade"
      :prepend-icon="item.icon"
      :title="item.title"
      @click="navigateTo(item.to)"
    />
  </v-list>
</template>
