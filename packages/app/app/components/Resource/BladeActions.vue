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
// When narrow, every command collapses into the … overflow menu — the close ✕ never collapses
const { smAndDown } = useVDisplay();
const isPublishable = computed(() => "publishable" in ResourceDefinitionMap[resource.type].capabilities);
const isPortable = computed(() => "portable" in ResourceDefinitionMap[resource.type].capabilities);
// The dialogs mount only while open so their fields start from the current resource every time
const isRenameOpen = ref(false);
const isDeleteOpen = ref(false);
const isShareOpen = ref(false);
</script>

<template>
  <template v-if="!smAndDown">
    <v-btn prepend-icon="mdi-refresh" variant="text" :loading="isLoading" @click="refresh()">Refresh</v-btn>
    <v-btn prepend-icon="mdi-pencil" variant="text" @click="isRenameOpen = true">Rename</v-btn>
    <v-btn color="error" prepend-icon="mdi-delete" variant="text" @click="isDeleteOpen = true">Delete</v-btn>
    <v-divider vertical mx-1 />
    <v-btn prepend-icon="mdi-content-copy" variant="text" @click="duplicate()">Duplicate</v-btn>
    <template v-if="isPublishable">
      <v-divider vertical mx-1 />
      <ResourcePublishToggle :publication :publish :unpublish />
      <!-- An unpublished resource has no public URL, so there is nothing to share until it has one -->
      <v-btn v-if="publication" prepend-icon="mdi-share-variant" variant="text" @click="isShareOpen = true">
        Share
      </v-btn>
    </template>
    <template v-if="isPortable">
      <v-divider vertical mx-1 />
      <ResourcePortableActions :resource />
    </template>
  </template>
  <ResourceBladeOverflowMenu
    v-else
    :duplicate
    :publication
    :publish
    :refresh
    :resource
    :unpublish
    @delete="isDeleteOpen = true"
    @rename="isRenameOpen = true"
    @share="isShareOpen = true"
  />
  <StyledTooltipIconButton icon="mdi-close" text="Close" :button-props="{ to: RoutePath.ResourcesAll }" />
  <ResourceRenameDialog v-if="isRenameOpen" v-model="isRenameOpen" :rename :resource />
  <ResourceDeleteDialog v-if="isDeleteOpen" v-model="isDeleteOpen" :remove :resource />
  <ResourceShareDialog v-if="isShareOpen" v-model="isShareOpen" :resource />
</template>
