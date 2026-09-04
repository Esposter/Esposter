<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import ResourceOverview from "@/components/Resource/Overview.vue";
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { ResourceEditorComponentMap } from "@/services/resource/ResourceEditorComponentMap";
import { ResourceOverviewComponentMap } from "@/services/resource/ResourceOverviewComponentMap";
import { ID_SEPARATOR } from "@esposter/shared";

interface Props {
  activeBlade: string;
  resource: Resource;
}

const { activeBlade, resource } = defineProps<Props>();
// The type's own blade wins over its inline editor, and the two are mutually exclusive — one Suspense
// Boundary renders whichever applies rather than two identical ones
const contentComponent = computed(
  () =>
    ResourceBladeDefinitionMap[resource.type].find(({ slug }) => slug === activeBlade)?.component ??
    (activeBlade === ResourceBladeType.Editor ? ResourceEditorComponentMap[resource.type] : undefined),
);
</script>

<template>
  <!-- The type's own Overview wraps the generic one; without an entry the generic one renders as-is -->
  <component
    :is="ResourceOverviewComponentMap[resource.type] ?? ResourceOverview"
    v-if="activeBlade === ResourceBladeType.Overview"
    :resource
  />
  <ResourceActivityLog
    v-else-if="activeBlade === ResourceBladeType.Activity"
    :key="resource.id"
    :resource-id="resource.id"
  />
  <Suspense v-else-if="contentComponent">
    <component :is="contentComponent" :key="`${resource.id}${ID_SEPARATOR}${activeBlade}`" />
    <template #fallback>
      <StyledSkeleton />
    </template>
  </Suspense>
</template>
