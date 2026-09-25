<script setup lang="ts">
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { Item } from "@/models/shared/Item";
import type { Resource } from "@esposter/db-schema";

import { ItemMetadataPropertyNames } from "#shared/models/entity/ItemMetadataPropertyNames";
import { ResourceListItemPropertyNames } from "#shared/models/resource/ResourceListItem";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import {
  RESOURCE_DATE_TIME_ATTRIBUTES,
  RESOURCE_LIST_ITEMS_PER_PAGE,
  RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS,
  RETENTION_ERROR_PERCENTAGE,
  RETENTION_WARNING_PERCENTAGE,
} from "@/services/resource/constants";
import { DeletedResourceHeaders } from "@/services/resource/DeletedResourceHeaders";
import { getPurgesInText } from "@/services/resource/getPurgesInText";
import { getRetentionElapsedPercentage } from "@/services/resource/getRetentionElapsedPercentage";
import { NO_ACTION_ITEMS } from "@/services/shared/constants";
import { useRecycleBinDialogStore } from "@/store/resource/recycleBinDialog";
import { RECYCLE_BIN_RETENTION_DAYS } from "@esposter/db-schema";

const { count, error, isPending, items, readDeletedResources, refresh } = useReadDeletedResources();
const recycleBinDialogStore = useRecycleBinDialogStore();
const { purgingId } = storeToRefs(recycleBinDialogStore);
const purgingResource = computed(() => items.value.find(({ id }) => id === purgingId.value));
const { checkIsRestorePending, restoreResource } = useRestoreResource(refresh);
const purgeResource = usePurgeResource(refresh);
const { getContextMenuProps } = useContextMenu();
const page = ref(1);
const itemsPerPage = ref(RESOURCE_LIST_ITEMS_PER_PAGE);
// Empty until a header is pressed, which the server reads as the newest deletion first
const sortBy = ref<SortItem<keyof ResourceListItem>[]>([]);
// The row's ⋮ menu and its context menu are the same two answers, so they have one definition
const getActionItems = (resource: Resource): Item[] => [
  {
    disabled: checkIsRestorePending(resource.id),
    meaning: UiIconMeaning.Undo,
    onClick: () => restoreResource(resource),
    title: "Restore",
  },
  {
    color: "error",
    isGroupStart: true,
    meaning: UiIconMeaning.Delete,
    onClick: () => {
      purgingId.value = resource.id;
    },
    title: "Delete forever",
  },
];
const resourceIdActionItemsMap = computed(() => new Map(items.value.map((item) => [item.id, getActionItems(item)])));
// The page, its size and its order are what the table reads, the first time too
watchImmediate([page, itemsPerPage, sortBy], async () => {
  await readDeletedResources({ itemsPerPage: itemsPerPage.value, page: page.value, sortBy: sortBy.value });
});
</script>

<!-- A deleted resource has no page to open onto, so its rows go nowhere and its two answers wait in its menu. How long
     each has left is the bin's whole point, so it reads as the storage meter does: blocks filling towards the purge -->
<template>
  <div flex flex-1 flex-col min-h-0 min-w-0 ui-body>
    <!-- The line never wraps: the note yields its width to the two marks, which stay on the row they act from -->
    <div px-4 py-2 flex gap-2 items-center>
      <span text-muted flex-1 min-w-0 truncate>
        Deleted resources are permanently removed after {{ RECYCLE_BIN_RETENTION_DAYS }} days.
      </span>
      <UiIconButton
        label="Refresh"
        :meaning="UiIconMeaning.Refresh"
        :variant="UiButtonVariant.Quiet"
        @click="refresh()"
      />
      <ResourceCloseButton />
    </div>
    <!-- A failed refresh over rows already shown keeps them, and says so above them -->
    <UiAlert v-if="error && items.length > 0" status="error" mx-4 mb-2>
      <div flex gap-2 items-center>
        <span flex-1 min-w-0>{{ error }}</span>
        <UiButton @click="refresh()">Try again</UiButton>
      </div>
    </UiAlert>
    <UiDataTable
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :columns="DeletedResourceHeaders"
      :get-item-title="({ name }) => name"
      :get-row-props="
        (item) => getContextMenuProps(item.id, () => resourceIdActionItemsMap.get(item.id) ?? NO_ACTION_ITEMS)
      "
      :is-pending
      :items
      :items-length="count"
      :items-per-page-options="RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS"
      label="Deleted resources"
      flex-1
    >
      <template #cell="{ column, item, value }">
        <ResourceListTypeCell v-if="column.key === ResourceListItemPropertyNames.type" :type="item.type" />
        <NuxtTime
          v-else-if="column.key === ItemMetadataPropertyNames.deletedAt && item.deletedAt"
          :="RESOURCE_DATE_TIME_ATTRIBUTES"
          :datetime="item.deletedAt"
        />
        <div v-else-if="column.key === 'retention'" flex gap-2 items-center>
          <UiMeter
            :high="RETENTION_ERROR_PERCENTAGE"
            :label="`Retention of ${item.name}`"
            :low="RETENTION_WARNING_PERCENTAGE"
            :value="getRetentionElapsedPercentage(item.deletedAt)"
            :value-text="getPurgesInText(item.deletedAt)"
          />
          <span text-muted text-nowrap aria-hidden="true">{{ getPurgesInText(item.deletedAt) }}</span>
        </div>
        <UiOverflowMenu
          v-else-if="column.key === 'actions'"
          :items="resourceIdActionItemsMap.get(item.id) ?? NO_ACTION_ITEMS"
          :label="`Actions for ${item.name}`"
        />
        <template v-else>{{ value }}</template>
      </template>
      <template #empty>
        <UiErrorState v-if="error" :error @retry="refresh()" />
        <UiEmptyState
          v-else
          :description="`Deleted resources appear here for ${RECYCLE_BIN_RETENTION_DAYS} days before they are permanently removed.`"
          :meaning="UiIconMeaning.Delete"
          title="Recycle bin is empty"
        />
      </template>
    </UiDataTable>
    <ResourceRecycleBinPurgeDialog v-if="purgingResource" :resource="purgingResource" @purge="purgeResource($event)" />
  </div>
</template>
