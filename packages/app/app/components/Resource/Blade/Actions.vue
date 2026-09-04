<script setup lang="ts">
import type { PortableFormat } from "@/models/resource/PortableFormat";
import type { Item } from "@/models/shared/Item";
import type { Resource } from "@esposter/db-schema";

import { hasCapability } from "#shared/services/resource/hasCapability";
import { useNavigationTrailStore } from "@/store/navigationTrail";
import { useResourceStore } from "@/store/resource";
import { takeOne } from "@esposter/shared";

interface Props {
  resource: Resource;
}

const { resource } = defineProps<Props>();
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
const isSaveVersionOpen = ref(false);
// The panel opens from here rather than from the editor, because Sheet and TodoList are blade-only types with
// No editor at all — the action bar is the one surface every type has. See /docs/platform/resource-snapshots
const { openVersionHistory } = useVersionHistoryRoute();
const { exportFormats, importFormats } = usePortableFormats(() => resource);
// A type with several formats gets one command whose submenu names them, rather than one command per format —
// Seven top-level buttons for a sheet is the same rail the Data blade just lost. A type with a single format
// (Email's personalized HTML) stays a plain command, since a menu holding one item is a click that buys nothing
const createFormatCommands = (
  verb: string,
  icon: string,
  formats: PortableFormat[],
  getRun: (format: PortableFormat) => (() => Promise<void>) | undefined,
  isGroupStart: boolean,
): Item[] => {
  if (formats.length === 0) return [];
  else if (formats.length === 1) {
    const format = takeOne(formats);
    return [{ icon, isGroupStart, onClick: () => getRun(format)?.(), title: `${verb} ${format.label}` }];
  }
  return [
    {
      icon,
      isGroupStart,
      items: formats.map<Item>((format) => ({
        icon: format.icon,
        onClick: () => getRun(format)?.(),
        title: format.label,
      })),
      title: verb,
    },
  ];
};
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
  // Every type has revisions, so both commands are unconditional — recovery is core rather than a capability
  {
    icon: "mdi-history",
    isGroupStart: true,
    onClick: () => openVersionHistory(),
    title: "Version history",
  },
  {
    icon: "mdi-content-save-outline",
    onClick: () => {
      isSaveVersionOpen.value = true;
    },
    title: "Save version",
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
  ...createFormatCommands("Import", "mdi-import", importFormats.value, ({ import: run }) => run, true),
  ...createFormatCommands("Export", "mdi-export", exportFormats.value, ({ export: run }) => run, false),
]);
</script>

<template>
  <template
    v-for="{ color, disabled, icon, isGroupStart, items, loading, onClick, title } of smAndDown ? [] : commandItems"
    :key="title"
  >
    <v-divider v-if="isGroupStart" vertical mx-1 />
    <v-menu v-if="items" :disabled>
      <template #activator="{ props: menuActivatorProps }">
        <v-btn
          append-icon="mdi-menu-down"
          :color
          :disabled
          :loading
          :prepend-icon="icon"
          variant="text"
          :="menuActivatorProps"
        >
          {{ title }}
        </v-btn>
      </template>
      <v-list density="compact">
        <v-list-item
          v-for="item of items"
          :key="item.title"
          :base-color="item.color"
          :disabled="item.disabled"
          :prepend-icon="item.icon"
          :title="item.title"
          @click="item.onClick?.($event)"
        />
      </v-list>
    </v-menu>
    <v-btn v-else :color :disabled :loading :prepend-icon="icon" variant="text" @click="onClick?.($event)">
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
  <ResourceVersionHistorySaveDialog v-if="isSaveVersionOpen" v-model="isSaveVersionOpen" />
</template>
