<script setup lang="ts">
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { ResourceBladeType } from "@/models/resource/ResourceBladeType";
import { ResourceEditorComponentMap } from "@/services/resource/ResourceEditorComponentMap";

interface ResourceBladeOutletProps {
  activeBlade: ResourceBladeType;
  publication?: ResourcePublication;
  resource: Resource;
}

const { activeBlade, publication, resource } = defineProps<ResourceBladeOutletProps>();
// A migrated editor renders inline; un-migrated types fall back to the launch panel
const editorComponent = computed(() => ResourceEditorComponentMap[resource.type]);
</script>

<template>
  <ResourceOverview v-if="activeBlade === ResourceBladeType.Overview" :publication :resource />
  <!-- Migrated editors can't SSR (VueFlow/GrapesJS), so render client-only; Suspense supports async editor setup -->
  <ClientOnly v-else-if="editorComponent">
    <Suspense>
      <component :is="editorComponent" />
      <template #fallback>
        <StyledSkeleton />
      </template>
    </Suspense>
    <template #fallback>
      <StyledSkeleton />
    </template>
  </ClientOnly>
  <ResourceEditorLaunch v-else :resource />
</template>
