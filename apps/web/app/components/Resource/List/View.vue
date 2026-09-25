<script setup lang="ts">
import type { ResourceFilterValues } from "@/models/resource/list/ResourceFilterValues";

import { ResourceListItemPropertyNames } from "#shared/models/resource/ResourceListItem";
import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { RESOURCE_LIST_ITEMS_PER_PAGE, RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS } from "@/services/resource/constants";
import { deserializeResourceColumnKeyWidthMap } from "@/services/resource/list/deserializeResourceColumnKeyWidthMap";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";
import { serializeResourceColumnKeyWidthMap } from "@/services/resource/list/serializeResourceColumnKeyWidthMap";
import { NO_ACTION_ITEMS } from "@/services/shared/constants";
import { useFavoriteStore } from "@/store/resource/favorite";
import { useListDialogStore } from "@/store/resource/listDialog";
import { RoutePath, takeOne } from "@esposter/shared";

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
onMounted(async () => {
  await readFavorites();
});
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
  { searchQuery: search, status, tagName, tagValue, types, updatedAfter, updatedBefore, updatedFilter },
  source,
);
const resourceIdActionItemsMap = computed(() => new Map(items.value.map((item) => [item.id, getActionItems(item)])));
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
// Every filter funnels through one key, so a change to any of them starts the list over from its first page
const filterKey = computed(() => JSON.stringify(filterValues.value));
const itemsPerPage = ref(RESOURCE_LIST_ITEMS_PER_PAGE);
const isGroupedByType = ref(false);
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
// The widths the reader dragged the columns to are the address's too, as "key:width,...", so a reload or a shared link
// Lays the list out the same
const columnWidthsQuery = useRouteQuery("columnWidths", "", { transform: String });
const columnKeyWidthMap = computed({
  get: () => deserializeResourceColumnKeyWidthMap(columnWidthsQuery.value),
  set: (newColumnKeyWidthMap) => {
    columnWidthsQuery.value = serializeResourceColumnKeyWidthMap(newColumnKeyWidthMap);
  },
});
const { clearSelection, selectedIds, selectedResources, updateSelection } = useResourceSelection(items);
const { getContextMenuProps } = useContextMenu();
// Held open across a list read — typing into the search box replaces `items` — so the target is dropped with
// The row rather than re-opening the dialog when a later read brings it back
const { isOpen: isRenameOpen, item: renamingResource } = useSingletonDialog(renamingId, () =>
  items.value.find(({ id }) => id === renamingId.value),
);
const renameResource = useRenameResource(renamingResource, refresh);
const deletingResource = computed(() => items.value.find(({ id }) => id === deletingId.value));
const deleteResources = useDeleteResources(items, count, refresh);

watch(filterKey, () => {
  page.value = 1;
});
// The page, its size and its order are the address's, so the list reads whatever they say, the first time too
watchImmediate([page, itemsPerPage, sortBy, filterKey], async () => {
  await readResources({ itemsPerPage: itemsPerPage.value, page: page.value, sortBy: sortBy.value });
});
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
    <ResourceListSummary
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
    <UiDataTable
      v-else
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      v-model:sort-by="sortBy"
      v-model:column-key-width-map="columnKeyWidthMap"
      :columns="visibleHeaders"
      :get-item-title="({ name }) => name"
      :get-row-props="
        (item) => getContextMenuProps(item.id, () => resourceIdActionItemsMap.get(item.id) ?? NO_ACTION_ITEMS)
      "
      :group-by="isGroupedByType ? ResourceListItemPropertyNames.type : undefined"
      :is-pending
      is-resizable
      is-selectable
      :items
      :items-length="count"
      :items-per-page-options="RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS"
      label="Resources"
      :selected-ids
      flex-1
      @open="({ id }) => navigateTo(RoutePath.Resource(id))"
      @update:selected-ids="(ids) => updateSelection(ids)"
    >
      <template #cell="{ column, item, value }">
        <!-- Every control nested in a row stops the click, so the row does not open behind it -->
        <div v-if="column.key === 'favorite'" @click.stop>
          <ResourceFavoriteToggle :resource="item" />
        </div>
        <ResourceListTypeCell v-else-if="column.key === ResourceListItemPropertyNames.type" :type="item.type" />
        <div v-else-if="column.key === 'actions'" @click.stop>
          <UiOverflowMenu
            :items="resourceIdActionItemsMap.get(item.id) ?? NO_ACTION_ITEMS"
            :label="`Actions for ${item.name}`"
          />
        </div>
        <template v-else>{{ value }}</template>
      </template>
      <template #group="{ items: groupItems }">
        <ResourceListTypeCell :type="takeOne(groupItems).type" />
        <span text-muted>{{ groupItems.length }}</span>
      </template>
      <template #empty>
        <ResourceListNoDataSlot :error :has-active-filters :source @clear="clearFilters()" @refresh="refresh()" />
      </template>
    </UiDataTable>
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
