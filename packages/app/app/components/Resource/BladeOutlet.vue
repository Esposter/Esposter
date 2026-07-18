<script setup lang="ts">
import type { Resource, ResourcePublication, ResourceTags } from "@esposter/db-schema";

import ResourceOverview from "@/components/Resource/Overview.vue";
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { ResourceEditorComponentMap } from "@/services/resource/ResourceEditorComponentMap";
import { ResourceOverviewComponentMap } from "@/services/resource/ResourceOverviewComponentMap";

interface ResourceBladeOutletProps {
  activeBlade: string;
  isLoading?: boolean;
  publication?: ResourcePublication;
  resource: Resource;
  updateTags?: (tags: ResourceTags) => Promise<void>;
}

const { activeBlade, isLoading, publication, resource, updateTags } = defineProps<ResourceBladeOutletProps>();
// The type's own blade wins over the built-ins; the Editor blade renders the type's inline editor
const bladeComponent = computed(
  () => ResourceBladeDefinitionMap[resource.type].find(({ slug }) => slug === activeBlade)?.component,
);
const editorComponent = computed(() => ResourceEditorComponentMap[resource.type]);
// The type's own Overview wraps the generic one; without an entry the generic one renders as-is
const overviewComponent = computed(() => ResourceOverviewComponentMap[resource.type] ?? ResourceOverview);
</script>

<template>
  <component
    :is="overviewComponent"
    v-if="activeBlade === ResourceBladeType.Overview"
    :is-loading
    :publication
    :resource
    :update-tags
  />
  <ResourceActivityLog
    v-else-if="activeBlade === ResourceBladeType.Activity"
    :key="resource.id"
    :resource-id="resource.id"
  />
  <Suspense v-else-if="activeBlade === ResourceBladeType.PublishHistory">
    <ResourcePublishHistory :key="resource.id" :resource />
    <template #fallback>
      <StyledSkeleton />
    </template>
  </Suspense>
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
