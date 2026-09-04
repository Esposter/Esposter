<script setup lang="ts">
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";
import type { ResourceFilterValues } from "@/models/resource/list/ResourceFilterValues";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { RESOURCE_LIST_ITEMS_PER_PAGE, RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS } from "@/services/resource/constants";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";
import { useFavoriteStore } from "@/store/resource/favorite";
import { useListDialogStore } from "@/store/resource/listDialog";
import { RoutePath } from "@esposter/shared";

interface Props {
  source?: ResourceListSource;
}
// Every menu entry renders this one surface pointed at a different set, so a capability built here — filters,
// Columns, grouping, selection, export — appears on all of them at once
const { source = ResourceListSource.All } = defineProps<Props>();
const { sortBy: defaultSortBy } = ResourceListSourceDefinitionMap[source];
const { getActionItems } = useResourceListActionItems();
const listDialogStore = useListDialogStore();
const { deletingId, renamingId } = storeToRefs(listDialogStore);
const favoriteStore = useFavoriteStore();
const { readFavorites } = favoriteStore;
// Every row renders a star, so the favorites are read once for the list rather than once per row
onMounted(readFavorites);
// The filter state mirrors to query params, so a global-search deep link lands the list filtered
const {
  clearFilters,
  hasActiveFilters,
  page,
  searchQuery,
  sortBy,
  status,
  tagName,
  tagValue,
  types,
  updatedAfter,
  updatedBefore,
  updatedFilter,
} = useResourceListFilters(defaultSortBy);
const { debouncedFilter: search, editedFilter: editedSearchQuery } = useDebouncedFilter(searchQuery);
const { count, createResourcesPageReader, error, isPending, items, readResources, refresh } = useReadResources(
  {
    searchQuery: search,
    status,
    tagName,
    tagValue,
    types,
    updatedAfter,
    updatedBefore,
    updatedFilter,
  },
  source,
);
const { exportAllResourcesCsv } = useExportResourcesCsv();
// One spelling of "everything this list is filtered by", so adding a filter is one edit rather than three
const filterValues = computed<ResourceFilterValues>(() => ({
  searchQuery: search.value,
  source,
  status: status.value,
  tagName: tagName.value,
  tagValue: tagValue.value,
  types: types.value,
  updatedAfter: updatedAfter.value,
  updatedBefore: updatedBefore.value,
  updatedFilter: updatedFilter.value,
}));
// Vuetify resets to page 1 and refires update:options whenever `search` changes, so every filter funnels through it
const filterKey = computed(() => JSON.stringify(filterValues.value));
const itemsPerPage = ref(RESOURCE_LIST_ITEMS_PER_PAGE);
const isGroupedByType = ref(false);
const groupBy = computed(() => (isGroupedByType.value ? [{ key: "type" }] : []));
// Summary is a lens on the same filtered query rather than a route, so it stays local to the workbench
const isSummaryView = ref(false);
const {
  counts: typeCounts,
  error: typeCountsError,
  isPending: isTypeCountsPending,
  refresh: refreshTypeCounts,
} = useReadResourceTypeCounts(() => filterValues.value);
// The cards are only mounted in summary mode, so the read follows the mode rather than every filter change
watch([isSummaryView, filterKey], async ([newIsSummaryView]) => {
  if (newIsSummaryView) await refreshTypeCounts();
});
const { visibleHeaders } = useResourceListColumns(source);
const { clearSelection, selectedIds, selectedResources, updateSelection } = useResourceSelection(items);
const contextMenuId = ref("");
const contextMenuPosition = ref<[number, number]>([0, 0]);
const { isOpen: isContextMenuOpen } = useSingletonDialog(contextMenuId);
const contextMenuResource = computed(() => items.value.find(({ id }) => id === contextMenuId.value));
// Held open across a list read — typing into the search box replaces `items` — so the target is dropped with
// The row rather than re-opening the dialog when a later read brings it back
const { isOpen: isRenameOpen, item: renamingResource } = useSingletonDialog(renamingId, () =>
  items.value.find(({ id }) => id === renamingId.value),
);
const renameResource = useRenameResource(renamingResource, refresh);
const deletingResource = computed(() => items.value.find(({ id }) => id === deletingId.value));
const deleteResources = useDeleteResources(items, count, refresh);
const onClickRow = (_event: MouseEvent, { item }: ItemSlot<ResourceListItem>) =>
  navigateTo(RoutePath.Resource(item.id));
const onContextMenuRow = (event: MouseEvent, { item }: ItemSlot<ResourceListItem>) => {
  event.preventDefault();
  contextMenuPosition.value = [event.clientX, event.clientY];
  contextMenuId.value = item.id;
};
const onUpdateOptions = async (options: ReadResourcesOptions) => {
  itemsPerPage.value = options.itemsPerPage;
  page.value = options.page;
  sortBy.value = options.sortBy;
  await readResources(options);
};
</script>

<template>
  <div flex flex-col h-full min-w-0>
    <ResourceListToolbar
      v-model:search="editedSearchQuery"
      v-model:is-summary-view="isSummaryView"
      v-model:is-grouped-by-type="isGroupedByType"
      :source
      @export="exportAllResourcesCsv(createResourcesPageReader())"
      @refresh="isSummaryView ? refreshTypeCounts() : refresh()"
    />
    <ResourceListSelectionToolbar
      v-if="selectedResources.length > 0"
      :selected-resources
      @clear="clearSelection()"
      @delete="
        (resources) => {
          clearSelection();
          deleteResources(resources);
        }
      "
    />
    <ResourceListFilterBar
      v-else
      v-model:status="status"
      v-model:tag-name="tagName"
      v-model:tag-value="tagValue"
      v-model:types="types"
      v-model:updated-after="updatedAfter"
      v-model:updated-before="updatedBefore"
      v-model:updated-filter="updatedFilter"
      :has-active-filters
      @clear="clearFilters()"
    />
    <ResourceListSummaryCards
      v-if="isSummaryView"
      :counts="typeCounts"
      :error="typeCountsError"
      :is-pending="isTypeCountsPending"
      @retry="refreshTypeCounts()"
      @select="
        (type) => {
          types = [type];
          page = 1;
          isSummaryView = false;
        }
      "
    />
    <v-data-table-server
      v-else
      height="100%"
      item-value="id"
      show-select
      flex
      flex-1
      flex-col
      :group-by
      :headers="visibleHeaders"
      :items
      :items-length="count"
      :items-per-page-options="RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS"
      :loading="isPending"
      :model-value="selectedIds"
      :page
      :search="filterKey"
      :sort-by
      @click:row="onClickRow"
      @contextmenu:row="onContextMenuRow"
      @update:model-value="updateSelection"
      @update:options="onUpdateOptions"
    >
      <template #[`item.favorite`]="{ item }">
        <!-- Every control nested in a row stops the click, so the row's own navigateTo does not fire behind it -->
        <div @click.stop>
          <ResourceFavoriteToggle :resource="item" />
        </div>
      </template>
      <template #[`item.type`]="{ item }">
        <ResourceListTypeCell :type="item.type" />
      </template>
      <template #[`item.actions`]="{ item }">
        <div @click.stop>
          <StyledOverflowMenu :items="getActionItems(item)" />
        </div>
      </template>
      <template #group-header="{ columns, isGroupOpen, item, toggleGroup }">
        <ResourceListGroupHeaderRow :columns :is-group-open :item :toggle-group />
      </template>
      <template #loading>
        <StyledSkeleton type="table-row@10" />
      </template>
      <template #no-data>
        <ResourceListNoDataSlot :error :has-active-filters :source @clear="clearFilters()" @refresh="refresh()" />
      </template>
    </v-data-table-server>
    <ResourceListContextMenu
      v-if="contextMenuResource"
      v-model="isContextMenuOpen"
      :position="contextMenuPosition"
      :resource="contextMenuResource"
    />
    <ResourceRenameDialog
      v-if="renamingResource"
      :key="renamingResource.id"
      v-model="isRenameOpen"
      :rename="renameResource"
      :resource="renamingResource"
    />
    <ResourceListDeleteDialog v-if="deletingResource" :resource="deletingResource" @delete="deleteResources($event)" />
    <!-- One capture dialog for the whole list — the bulk toolbar and the row ⋮ menu both drive it -->
    <ResourceBlueprintCaptureDialog />
  </div>
</template>
