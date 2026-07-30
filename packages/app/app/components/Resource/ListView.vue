<script setup lang="ts">
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";
import type { Resource } from "@esposter/db-schema";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import {
  DEFAULT_RESOURCE_SORT_BY,
  RESOURCE_LIST_ITEMS_PER_PAGE,
  RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS,
} from "@/services/resource/constants";
import { ResourceHeaders } from "@/services/resource/ResourceHeaders";
import { RESOURCE_SEARCH_DEBOUNCE_MS } from "@/services/resource/search/constants";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useFavoriteStore } from "@/store/resource/favorite";
import { useListDialogStore } from "@/store/resource/listDialog";
import { RoutePath } from "@esposter/shared";

interface ResourceListViewProps {
  // When set, a close ✕ routes here (the base list closes back a layer); omitted when it sits behind a blade
  closeTo?: string;
  // The blade list box is a plain table — no toolbar, filter pills, selection, or context menu
  isSearchable?: false;
}

const { closeTo, isSearchable = true } = defineProps<ResourceListViewProps>();
const { getActionItems } = useResourceListActionItems();
const listDialogStore = useListDialogStore();
const { deletingId, renamingId } = storeToRefs(listDialogStore);
const favoriteStore = useFavoriteStore();
// Every row renders a star, so the favorites are read once for the list rather than once per row
onMounted(() => favoriteStore.readFavorites());
// The workbench filter state mirrors to query params (deep links from global search included);
// The blade list renders no filter UI and rides its host page's route, so its page/sort state
// Lives in local refs instead of writing query params the workbench owns
const {
  clearFilters,
  hasActiveFilters,
  page: routePage,
  searchQuery,
  sortBy: routeSortBy,
  status,
  tagName,
  tagValue,
  types,
  updatedAfter,
  updatedBefore,
  updatedFilter,
} = useResourceListFilters();
const page = isSearchable ? routePage : ref(1);
const sortBy = isSearchable ? routeSortBy : ref<SortItem<keyof Resource>[]>([...DEFAULT_RESOURCE_SORT_BY]);
// Typing buffers in a local clone so router.replace isn't spammed per keystroke;
// UseCloned keeps route → field flowing (back-nav, clear filters) while the debounced value follows field → route
const { cloned: searchInput } = useCloned(searchQuery);
const search = refDebounced(searchInput, RESOURCE_SEARCH_DEBOUNCE_MS);
watch(search, (newSearch) => {
  searchQuery.value = newSearch;
});
const { count, createResourcesPageReader, error, isLoading, items, readResources, refresh } = useReadResources({
  searchQuery: search,
  status,
  tagName,
  tagValue,
  types,
  updatedAfter,
  updatedBefore,
  updatedFilter,
});
const { exportAllResourcesCsv } = useExportResourcesCsv();
// Vuetify resets to page 1 and refires update:options whenever `search` changes, so every filter funnels through it
const filterKey = computed(() =>
  JSON.stringify({
    search: search.value,
    status: status.value,
    tagName: tagName.value,
    tagValue: tagValue.value,
    types: types.value,
    updatedAfter: updatedAfter.value,
    updatedBefore: updatedBefore.value,
    updatedFilter: updatedFilter.value,
  }),
);
const itemsPerPage = ref(RESOURCE_LIST_ITEMS_PER_PAGE);
const isGroupedByType = ref(false);
// Summary is a lens on the same filtered query rather than a route, so it stays local to the workbench
const isSummaryView = ref(false);
const {
  counts: typeCounts,
  error: typeCountsError,
  isLoading: isLoadingTypeCounts,
  refresh: refreshTypeCounts,
} = useReadResourceTypeCounts(() => ({
  searchQuery: search.value,
  status: status.value,
  tagName: tagName.value,
  tagValue: tagValue.value,
  updatedAfter: updatedAfter.value,
  updatedBefore: updatedBefore.value,
  updatedFilter: updatedFilter.value,
}));
// The cards are only mounted in summary mode, so the read follows the mode rather than every filter change
watch([isSummaryView, filterKey], async ([newIsSummaryView]) => {
  if (newIsSummaryView) await refreshTypeCounts();
});
const hiddenColumnKeys = useLocalStorage<string[]>(LocalStorageKey.ResourceListHiddenColumns, []);
const visibleHeaders = computed(() => ResourceHeaders.filter(({ key }) => !hiddenColumnKeys.value.includes(key)));
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
const onClickRow = (_event: MouseEvent, { item }: ItemSlot<Resource>) => navigateTo(RoutePath.Resource(item.id));
const onContextMenuRow = (event: MouseEvent, { item }: ItemSlot<Resource>) => {
  if (!isSearchable) return;

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
    <template v-if="isSearchable">
      <ResourceListToolbar
        v-model:search="searchInput"
        v-model:is-summary-view="isSummaryView"
        v-model:is-grouped-by-type="isGroupedByType"
        v-model:hidden-column-keys="hiddenColumnKeys"
        :close-to
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
    </template>
    <ResourceListSummaryCards
      v-if="isSummaryView"
      :counts="typeCounts"
      :error="typeCountsError"
      :is-loading="isLoadingTypeCounts"
      @retry="refreshTypeCounts()"
      @select="
        (type) => {
          types = [type];
          page = 1;
          isSummaryView = false;
        }
      "
    />
    <StyledDataTableServer
      v-else
      flex
      flex-1
      flex-col
      :data-table-server-props="{
        groupBy: isGroupedByType ? [{ key: 'type' }] : [],
        headers: visibleHeaders,
        height: '100%',
        items,
        itemsLength: count,
        itemsPerPageOptions: RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS,
        itemValue: 'id',
        loading: isLoading,
        modelValue: selectedIds,
        page,
        search: filterKey,
        showSelect: isSearchable,
        sortBy,
      }"
      @click:row="onClickRow"
      @contextmenu:row="onContextMenuRow"
      @update:model-value="updateSelection"
      @update:options="onUpdateOptions"
    >
      <template #[`item.favorite`]="{ item }">
        <!-- stop keeps the row's navigateTo from firing when the star is clicked -->
        <div @click.stop>
          <ResourceFavoriteToggle :resource="item" />
        </div>
      </template>
      <template #[`item.type`]="{ item }">
        <ResourceListTypeCell :type="item.type" />
      </template>
      <template #[`item.actions`]="{ item }">
        <!-- stop keeps the row's navigateTo from firing when the menu is opened -->
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
        <ResourceListNoDataSlot :error :has-active-filters @clear="clearFilters()" @refresh="refresh()" />
      </template>
    </StyledDataTableServer>
    <ResourceListContextMenu
      v-if="isSearchable && contextMenuResource"
      v-model="isContextMenuOpen"
      :position="contextMenuPosition"
      :resource="contextMenuResource"
    />
    <!-- Outside the isSearchable gate: the blade list's row ⋮ menu opens these too -->
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
