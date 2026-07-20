<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { hasCapability } from "#shared/services/resource/hasCapability";
import { RoutePath } from "@esposter/shared";

interface ResourceBladeActionsProps {
  duplicate: () => Promise<void>;
  isDuplicatePending?: boolean;
  isLoading?: boolean;
  isPublishPending?: boolean;
  isUnpublishPending?: boolean;
  publication?: ResourcePublication;
  publish: () => Promise<void>;
  refresh: () => Promise<void>;
  remove: () => Promise<boolean>;
  rename: (name: string) => Promise<void>;
  resource: Resource;
  unpublish: () => Promise<void>;
}

const {
  duplicate,
  isDuplicatePending,
  isLoading,
  isPublishPending,
  isUnpublishPending,
  publication,
  publish,
  refresh,
  remove,
  rename,
  resource,
  unpublish,
} = defineProps<ResourceBladeActionsProps>();
// When narrow, every command collapses into the … overflow menu — the close ✕ never collapses
const { smAndDown } = useVDisplay();
const isPublishable = computed(() => hasCapability(resource.type, "publishable"));
const isPortable = computed(() => hasCapability(resource.type, "portable"));
// The dialogs mount only while open so their fields start from the current resource every time
const isRenameOpen = ref(false);
const isDeleteOpen = ref(false);
const isShareOpen = ref(false);
const { exportFormats, importFormats } = usePortableFormats(() => resource);
// The collapsed menu is the same command set as the wide bar, derived from the same gates
// (isPublishable, publication, portable formats) so the two renderings cannot diverge
const overflowItems = computed<Item[]>(() => [
  { icon: "mdi-refresh", onClick: () => refresh(), title: "Refresh" },
  {
    icon: "mdi-pencil",
    onClick: () => {
      isRenameOpen.value = true;
    },
    title: "Rename",
  },
  {
    color: "error",
    icon: "mdi-delete",
    onClick: () => {
      isDeleteOpen.value = true;
    },
    title: "Delete",
  },
  { disabled: isDuplicatePending, icon: "mdi-content-copy", onClick: () => duplicate(), title: "Duplicate" },
  ...(isPublishable.value
    ? [
        publication
          ? {
              disabled: isUnpublishPending,
              icon: "mdi-cloud-off-outline",
              onClick: () => unpublish(),
              title: "Unpublish",
            }
          : { disabled: isPublishPending, icon: "mdi-cloud-upload", onClick: () => publish(), title: "Publish" },
      ]
    : []),
  // An unpublished resource has no public URL, so there is nothing to share until it has one
  ...(isPublishable.value && publication
    ? [
        {
          icon: "mdi-share-variant",
          onClick: () => {
            isShareOpen.value = true;
          },
          title: "Share",
        },
      ]
    : []),
  ...importFormats.value.map(({ import: importFormat, label }) => ({
    icon: "mdi-import",
    onClick: () => importFormat?.(),
    title: `Import ${label}`,
  })),
  ...exportFormats.value.map(({ export: exportFormat, label }) => ({
    icon: "mdi-export",
    onClick: () => exportFormat?.(),
    title: `Export ${label}`,
  })),
]);
</script>

<template>
  <template v-if="!smAndDown">
    <v-btn prepend-icon="mdi-refresh" variant="text" :loading="isLoading" @click="refresh()">Refresh</v-btn>
    <v-btn prepend-icon="mdi-pencil" variant="text" @click="isRenameOpen = true">Rename</v-btn>
    <v-btn color="error" prepend-icon="mdi-delete" variant="text" @click="isDeleteOpen = true">Delete</v-btn>
    <v-divider vertical mx-1 />
    <v-btn
      :disabled="isDuplicatePending"
      :loading="isDuplicatePending"
      prepend-icon="mdi-content-copy"
      variant="text"
      @click="duplicate()"
    >
      Duplicate
    </v-btn>
    <template v-if="isPublishable">
      <v-divider vertical mx-1 />
      <ResourcePublishToggle :is-publish-pending :is-unpublish-pending :publication :publish :unpublish />
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
  <StyledOverflowMenu v-else icon="mdi-dots-horizontal" :items="overflowItems" />
  <!-- One click, one icon: the star stays out of the overflow menu like the close ✕ -->
  <ResourceFavoriteToggle :resource />
  <StyledTooltipIconButton :to="RoutePath.ResourcesAll" icon="mdi-close" text="Close" />
  <ResourceRenameDialog v-if="isRenameOpen" v-model="isRenameOpen" :rename :resource />
  <ResourceDeleteDialog v-if="isDeleteOpen" v-model="isDeleteOpen" :remove :resource />
  <ResourceShareDialog v-if="isShareOpen" v-model="isShareOpen" :resource />
</template>
