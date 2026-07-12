<script setup lang="ts">
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { ResourceEditorComponentMap } from "@/services/resource/ResourceEditorComponentMap";

interface ResourceBladeOutletProps {
  activeBlade: string;
  isLoading?: boolean;
  publication?: ResourcePublication;
  resource: Resource;
}

const { activeBlade, isLoading, publication, resource } = defineProps<ResourceBladeOutletProps>();
// The type's own blade wins over the built-ins; the Editor blade renders the type's inline editor
const bladeComponent = computed(
  () => ResourceBladeDefinitionMap[resource.type].find(({ slug }) => slug === activeBlade)?.component,
);
const editorComponent = computed(() => ResourceEditorComponentMap[resource.type]);
</script>

<template>
  <ResourceOverview v-if="activeBlade === ResourceBladeType.Overview" :is-loading :publication :resource />
  <Suspense v-else-if="bladeComponent">
    <component :is="bladeComponent" :key="`${resource.id}-${activeBlade}`" />
    <template #fallback>
      <StyledSkeleton />
    </template>
  </Suspense>
  <Suspense v-else-if="editorComponent">
    <component :is="editorComponent" :key="resource.id" />
    <template #fallback>
      <StyledSkeleton />
    </template>
  </Suspense>
</template>
