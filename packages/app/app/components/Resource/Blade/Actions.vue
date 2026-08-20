<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { Resource } from "@esposter/db-schema";

import { hasCapability } from "#shared/services/resource/hasCapability";
import { useNavigationTrailStore } from "@/store/navigationTrail";
import { useResourceStore } from "@/store/resource";

interface ResourceBladeActionsProps {
  resource: Resource;
}

const { resource } = defineProps<ResourceBladeActionsProps>();
// When narrow, every command collapses into the … overflow menu — the star and the close ✕ never collapse
const { smAndDown } = useVDisplay();
// The ✕ peels back to wherever the trail says the visitor came from, so it and the last crumb are one move
const navigationTrailStore = useNavigationTrailStore();
const { closeTo } = storeToRefs(navigationTrailStore);
const resourceStore = useResourceStore();
const { isDuplicatePending, isPending, isPublicationPending, publication } = storeToRefs(resourceStore);
const { deleteResource, duplicateResource, publishResource, readResource, renameResource, unpublishResource } =
  resourceStore;
const isPublishable = computed(() => hasCapability(resource.type, "publishable"));
// The dialogs mount only while open so their fields start from the current resource every time
const isRenameOpen = ref(false);
const isDeleteOpen = ref(false);
const isShareOpen = ref(false);
const { exportFormats, importFormats } = usePortableFormats(() => resource);
// One command set rendered two ways — a labelled bar when there is room, the overflow menu when there is not.
// Built once rather than written twice, so a label, an icon or a pending state cannot differ between them
const commandItems = computed<Item[]>(() => [
  { icon: "mdi-refresh", loading: isPending.value, onClick: () => readResource(), title: "Refresh" },
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
  {
    disabled: isDuplicatePending.value,
    icon: "mdi-content-copy",
    isGroupStart: true,
    loading: isDuplicatePending.value,
    onClick: () => duplicateResource(),
    title: "Duplicate",
  },
  // Publishing and unpublishing are one executor, so one pending flag covers the single button that is
  // Rendered for whichever of them applies
  ...(isPublishable.value
    ? [
        publication.value
          ? {
              disabled: isPublicationPending.value,
              icon: "mdi-cloud-off-outline",
              isGroupStart: true,
              loading: isPublicationPending.value,
              onClick: () => unpublishResource(),
              title: "Unpublish",
            }
          : {
              disabled: isPublicationPending.value,
              icon: "mdi-cloud-upload",
              isGroupStart: true,
              loading: isPublicationPending.value,
              onClick: () => publishResource(),
              title: "Publish",
            },
      ]
    : []),
  // An unpublished resource has no public URL, so there is nothing to share until it has one
  ...(isPublishable.value && publication.value
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
  ...importFormats.value.map<Item>(({ import: importFormat, label }, index) => ({
    icon: "mdi-import",
    isGroupStart: index === 0,
    onClick: () => importFormat?.(),
    title: `Import ${label}`,
  })),
  ...exportFormats.value.map<Item>(({ export: exportFormat, label }) => ({
    icon: "mdi-export",
    onClick: () => exportFormat?.(),
    title: `Export ${label}`,
  })),
]);
</script>

<template>
  <template
    v-for="{ color, disabled, icon, isGroupStart, loading, onClick, title } of smAndDown ? [] : commandItems"
    :key="title"
  >
    <v-divider v-if="isGroupStart" vertical mx-1 />
    <v-btn :color :disabled :loading :prepend-icon="icon" variant="text" @click="onClick?.($event)">
      {{ title }}
    </v-btn>
  </template>
  <StyledOverflowMenu v-if="smAndDown" icon="mdi-dots-horizontal" :items="commandItems" />
  <!-- One click, one icon: the star stays out of the overflow menu like the close ✕ -->
  <ResourceFavoriteToggle :resource />
  <StyledTooltipIconButton :to="closeTo" icon="mdi-close" text="Close" />
  <ResourceRenameDialog v-if="isRenameOpen" v-model="isRenameOpen" :rename="renameResource" :resource />
  <ResourceDeleteDialog v-if="isDeleteOpen" v-model="isDeleteOpen" :remove="deleteResource" :resource />
  <ResourceShareDialog v-if="isShareOpen" v-model="isShareOpen" :resource />
</template>
