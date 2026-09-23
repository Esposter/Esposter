<script setup lang="ts">
import type { PortableFormat } from "@/models/resource/PortableFormat";
import type { Item } from "@/models/shared/Item";
import type { Resource } from "@esposter/db-schema";

import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useNavigationTrailStore } from "@/store/navigationTrail";
import { useResourceStore } from "@/store/resource";

interface Props {
  resource: Resource;
}

const { resource } = defineProps<Props>();
const navigationTrailStore = useNavigationTrailStore();
const { closeTo } = storeToRefs(navigationTrailStore);
const resourceStore = useResourceStore();
const { isDuplicatePending, isPending, isPublicationPending, publication } = storeToRefs(resourceStore);
const { deleteResource, duplicateResource, publishResource, readResource, renameResource, unpublishResource } =
  resourceStore;
const { getContextMenuProps } = useContextMenu();
const isPublishable = computed(() => checkHasCapability(resource.type, "publishable"));
// The dialogs mount only while open so their fields start from the current resource every time
const isRenameOpen = ref(false);
const isDeleteOpen = ref(false);
const isShareOpen = ref(false);
// The panel opens from here rather than from the editor, because Sheet and TodoList are blade-only types with
// No editor at all — the header is the one surface every type has. See /docs/resource/resource-snapshots
const { openVersionHistory } = useVersionHistoryRoute();
const { exportFormats, importFormats } = usePortableFormats(() => resource);
// One command per format, named by its verb and the format, the first opening its group: a submenu is a second
// Aim the pointer has to hold, where a flat group is read at a glance
const createFormatItems = (
  verb: string,
  icon: string,
  formats: PortableFormat[],
  getRun: (format: PortableFormat) => (() => Promise<void>) | undefined,
): Item[] =>
  formats.map((format, index) => ({
    icon,
    isGroupStart: index === 0,
    onClick: () => getRun(format)?.(),
    title: `${verb} ${format.label}`,
  }));
// Every command but the lead one, in the overflow menu on every width and on a right-click of the title, so the two
// Never disagree. Delete comes last, alone, in the danger colour
const items = computed<Item[]>(() => [
  { disabled: isPending.value, icon: "i-pixelarticons:reload", onClick: () => readResource(), title: "Refresh" },
  {
    icon: "i-pixelarticons:pencil",
    onClick: () => {
      isRenameOpen.value = true;
    },
    title: "Rename",
  },
  {
    disabled: isDuplicatePending.value,
    icon: "i-pixelarticons:copy",
    onClick: () => duplicateResource(),
    title: "Duplicate",
  },
  // Every type has revisions, so the command is unconditional — recovery is core rather than a capability.
  // Taking one is not a command at all: revisions accrue on their own, and a Save beside an editor that
  // Already persists on its own would read as the thing that makes an edit durable
  { icon: "i-pixelarticons:clock", isGroupStart: true, onClick: () => openVersionHistory(), title: "Version history" },
  ...(isPublishable.value && publication.value
    ? [
        {
          disabled: isPublicationPending.value,
          icon: "i-pixelarticons:cloud",
          isGroupStart: true,
          onClick: () => unpublishResource(),
          title: "Unpublish",
        },
      ]
    : []),
  ...createFormatItems("Import", "i-pixelarticons:upload", importFormats.value, ({ import: run }) => run),
  ...createFormatItems("Export", "i-pixelarticons:download", exportFormats.value, ({ export: run }) => run),
  {
    color: "error",
    icon: "i-pixelarticons:trash",
    isGroupStart: true,
    onClick: () => {
      isDeleteOpen.value = true;
    },
    title: "Delete",
  },
]);
</script>

<!-- The resource is what the page is about, so it leads the row as an item in its slot: the type's mark in a sunk
     block, as an inventory holds it, beside the name and the type it is. The one action shown is the next step
     towards others seeing it, publishing and then sharing; the rest wait in the overflow menu -->
<template>
  <div flex flex-wrap gap-3 items-center>
    <div :="getContextMenuProps(resource.id, () => items)" flex flex-1 gap-3 min-w-0 items-center>
      <span p-2 flex shrink-0 ui-sunk>
        <span :class="ResourceDefinitionMap[resource.type].icon" aria-hidden="true" size-6 />
      </span>
      <div flex flex-col min-w-0>
        <h1 ui-title truncate>{{ resource.name }}</h1>
        <span text-muted>{{ ResourceDefinitionMap[resource.type].title }}</span>
      </div>
    </div>
    <div flex gap-2 items-center>
      <!-- Beside the commands rather than inside the blade, because content saves are the resource's and every blade
           of it writes through the same door — /docs/resource/resource-save-state -->
      <ResourceSaveStateIndicator :resource />
      <template v-if="isPublishable">
        <UiButton v-if="publication" :variant="UiButtonVariant.Accent" @click="isShareOpen = true">Share</UiButton>
        <UiButton v-else :disabled="isPublicationPending" :variant="UiButtonVariant.Accent" @click="publishResource()">
          Publish
          <UiSpinner v-if="isPublicationPending" />
        </UiButton>
      </template>
      <ResourceFavoriteToggle :resource />
      <UiOverflowMenu :items label="Resource actions" />
      <UiTooltip #default="{ activatorProps }" label="Close">
        <UiButtonLink :="activatorProps" :to="closeTo" aria-label="Close" :variant="UiButtonVariant.Quiet" px-0>
          <UiIcon :meaning="UiIconMeaning.Close" />
        </UiButtonLink>
      </UiTooltip>
    </div>
    <ResourceRenameDialog v-if="isRenameOpen" v-model="isRenameOpen" :rename="renameResource" :resource />
    <ResourceDeleteDialog v-if="isDeleteOpen" v-model="isDeleteOpen" :remove="deleteResource" :resource />
    <ResourceShareDialog v-if="isShareOpen" v-model="isShareOpen" :resource />
  </div>
</template>
