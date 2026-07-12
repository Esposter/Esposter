<script setup lang="ts">
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { RoutePath } from "@esposter/shared";

interface ResourceBladeActionsProps {
  duplicate: () => Promise<void>;
  isLoading?: boolean;
  publication?: ResourcePublication;
  publish: () => Promise<void>;
  refresh: () => Promise<void>;
  remove: () => Promise<boolean>;
  rename: (name: string) => Promise<void>;
  resource: Resource;
  unpublish: () => Promise<void>;
}

const { duplicate, isLoading, publication, publish, refresh, remove, rename, resource, unpublish } =
  defineProps<ResourceBladeActionsProps>();
// When narrow, trailing commands collapse into the … overflow menu — the close ✕ never collapses
const { smAndDown } = useVDisplay();
const isPublishable = computed(() => "publishable" in ResourceDefinitionMap[resource.type].capabilities);
const isPortable = computed(() => "portable" in ResourceDefinitionMap[resource.type].capabilities);
</script>

<template>
  <v-btn prepend-icon="mdi-refresh" variant="text" :loading="isLoading" @click="refresh()">Refresh</v-btn>
  <ResourceRenameDialogButton :rename :resource />
  <ResourceDeleteDialogButton :remove :resource />
  <template v-if="!smAndDown">
    <v-divider mx-1 vertical />
    <v-btn prepend-icon="mdi-content-copy" variant="text" @click="duplicate()">Duplicate</v-btn>
    <template v-if="isPublishable">
      <v-divider mx-1 vertical />
      <ResourcePublishToggle :publication :publish :unpublish />
    </template>
    <template v-if="isPortable">
      <v-divider mx-1 vertical />
      <ResourcePortableActions :resource />
    </template>
  </template>
  <ResourceBladeOverflowMenu v-else :duplicate :publication :publish :resource :unpublish />
  <StyledTooltipIconButton icon="mdi-close" text="Close" :button-props="{ to: RoutePath.ResourcesAll }" />
</template>
