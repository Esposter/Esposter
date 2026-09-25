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
  <!-- A resolved Suspense otherwise keeps the blade being left on screen until the next one resolves, so a switch
    reads as a click that did nothing. A zero timeout swaps in the fallback at once; a blade over content already
    read resolves in the same task, before the browser paints, so only a real wait — a first open, or a blade's
    chunk arriving — is ever seen as one -->
  <Suspense v-else-if="contentComponent" :timeout="0">
    <component :is="contentComponent" :key="`${resource.id}${ID_SEPARATOR}${activeBlade}`" />
    <!-- A blade may be a sheet, a calendar or an editor, so no one skeleton is its shape: the spinner says it is coming -->
    <template #fallback>
      <p role="status" text-muted p-8 flex gap-2 items-center justify-center>
        <UiSpinner />
        Loading…
      </p>
    </template>
  </Suspense>
</template>
