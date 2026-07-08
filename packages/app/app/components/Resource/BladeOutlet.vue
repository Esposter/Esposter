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
  <!-- Migrated editors (e.g. VueFlow) can't SSR, so the inline blade renders client-only -->
  <ClientOnly v-else-if="editorComponent">
    <component :is="editorComponent" />
    <template #fallback>
      <StyledSkeleton />
    </template>
  </ClientOnly>
  <ResourceEditorLaunch v-else :resource />
</template>
