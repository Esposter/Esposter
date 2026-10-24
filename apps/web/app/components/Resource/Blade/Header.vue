<script setup lang="ts">
import type { Item } from "@/models/shared/Item";
import type { ResourceInResource } from "@esposter/db-schema";

import { checkHasCapability } from "#shared/services/resource/checkHasCapability";
import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { exportDatasetCsv } from "@/services/dataset/exportDatasetCsv";
import { getResourceBladeItems } from "@/services/resource/getResourceBladeItems";
import { useResourceStore } from "@/store/resource";
import { RoutePath } from "@esposter/shared";

interface Props {
  resource: ResourceInResource;
}

const { resource } = defineProps<Props>();
const resourceStore = useResourceStore();
const { isDuplicatePending, isPending, isPublicationPending, publication } = storeToRefs(resourceStore);
const { deleteResource, duplicateResource, publishResource, readResource, renameResource, unpublishResource } =
  resourceStore;
const { getContextMenuProps } = useContextMenu();
const isPublishable = computed(() => checkHasCapability(resource.type, "publishable"));
// The dialogs mount only while open so their fields start from the current resource every time
const isRenameOpen = ref(false);
const isShareOpen = ref(false);
const isDeleteOpen = ref(false);
// What the delete confirmation asks about, for the warning of what it leaves dangling
const ids = computed(() => [resource.id]);
// The panel opens from here rather than from the editor, because Sheet and TodoList are blade-only types with
// No editor at all — the header is the one surface every type has. See openspec/specs/resource/resource-snapshots/design.md
const { openVersionHistory } = useVersionHistoryRoute();
const { exportFormats, importFormats } = usePortableFormats(() => resource);
// Every command but the lead one, in the overflow menu on every width and on a right-click of the title, so the two
// Never disagree. Delete comes last, alone, in the danger colour
const items = computed<Item[]>(() =>
  getResourceBladeItems(resource, {
    commands: {
      delete: () => {
        isDeleteOpen.value = true;
      },
      duplicate: duplicateResource,
      exportDatasetCsv: () => exportDatasetCsv(resource),
      read: readResource,
      rename: () => {
        isRenameOpen.value = true;
      },
      unpublish: unpublishResource,
      versionHistory: openVersionHistory,
    },
    exportFormats: exportFormats.value,
    importFormats: importFormats.value,
    isDuplicatePending: isDuplicatePending.value,
    isPending: isPending.value,
    isPublicationPending: isPublicationPending.value,
    isPublished: isPublishable.value && Boolean(publication.value),
  }),
);
</script>

<!-- The resource is what the page is about, so it leads the row as an item in its slot: the type's mark in its
     block, as an inventory holds it, beside the name and the type it is. The one action shown is the next step
     towards others seeing it, publishing and then sharing; the rest wait in the overflow menu. The row never wraps: the
     name yields its width to the commands, which stay on the line they act from -->
<template>
  <div flex gap-3 items-center>
    <div :="getContextMenuProps(resource.id, () => items)" flex flex-1 gap-3 min-w-0 items-center>
      <ResourceTypeMark :type="resource.type" />
      <div flex flex-col min-w-0>
        <h1 truncate ui-title>{{ resource.name }}</h1>
        <span text-muted truncate>{{ ResourceDefinitionMap[resource.type].title }}</span>
      </div>
    </div>
    <div flex shrink-0 gap-1 items-center>
      <!-- Beside the commands rather than inside the blade, because content saves are the resource's and every blade
           of it writes through the same door — openspec/specs/resource/resource-save-state/design.md -->
      <ResourceSaveStateIndicator :resource />
      <template v-if="isPublishable">
        <UiButton v-if="publication" :variant="UiButtonVariant.Accent" @click="isShareOpen = true">Share</UiButton>
        <UiButton
          v-else
          :is-pending="isPublicationPending"
          :variant="UiButtonVariant.Accent"
          @click="publishResource()"
        >
          Publish
        </UiButton>
      </template>
      <ResourceFavoriteToggle :resource />
      <UiOverflowMenu :items label="Resource actions" />
      <ResourceCloseButton />
    </div>
    <ResourceRenameDialog v-if="isRenameOpen" v-model="isRenameOpen" :rename="renameResource" :resource />
    <ResourceShareDialog v-if="isShareOpen" v-model="isShareOpen" :resource />
    <UiConfirmDialog
      v-model="isDeleteOpen"
      confirm-label="Delete"
      title="Delete resource"
      :confirm="
        async () => {
          if (await deleteResource()) await navigateTo(RoutePath.ResourceExplorerAll);
        }
      "
    >
      <p>Move {{ resource.name }} to the recycle bin? You can restore it from there.</p>
      <!-- The confirmation stays mounted while closed, so the read waits for it to open -->
      <ResourceConsumersWarning v-if="isDeleteOpen" :ids />
    </UiConfirmDialog>
  </div>
</template>
