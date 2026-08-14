<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import ResourceOverview from "@/components/Resource/Overview.vue";
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { ResourceBladeDefinitionMap } from "@/services/resource/ResourceBladeDefinitionMap";
import { ResourceEditorComponentMap } from "@/services/resource/ResourceEditorComponentMap";
import { ResourceOverviewComponentMap } from "@/services/resource/ResourceOverviewComponentMap";
import { COMPOSITE_KEY_SEPARATOR } from "@/services/shared/constants";

interface ResourceBladeOutletProps {
  activeBlade: string;
  resource: Resource;
}

const { activeBlade, resource } = defineProps<ResourceBladeOutletProps>();
// The type's own blade wins over the built-ins; the Editor blade renders the type's inline editor
const bladeComponent = computed(
  () => ResourceBladeDefinitionMap[resource.type].find(({ slug }) => slug === activeBlade)?.component,
);
// The type's own blade wins over its inline editor, and the two are mutually exclusive — one Suspense
// Boundary renders whichever applies rather than two identical ones
const contentComponent = computed(
  () =>
    bladeComponent.value ??
    (activeBlade === ResourceBladeType.Editor ? ResourceEditorComponentMap[resource.type] : undefined),
);
// The type's own Overview wraps the generic one; without an entry the generic one renders as-is
const overviewComponent = computed(() => ResourceOverviewComponentMap[resource.type] ?? ResourceOverview);
</script>

<template>
  <component :is="overviewComponent" v-if="activeBlade === ResourceBladeType.Overview" :resource />
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
  <Suspense v-else-if="contentComponent">
    <component :is="contentComponent" :key="`${resource.id}${COMPOSITE_KEY_SEPARATOR}${activeBlade}`" />
    <template #fallback>
      <StyledSkeleton />
    </template>
  </Suspense>
</template>
