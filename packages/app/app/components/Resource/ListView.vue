<script setup lang="ts">
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";
import type { Item } from "@/models/shared/Item";
import type { Resource, ResourceType } from "@esposter/db-schema";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { pluralize } from "#shared/util/text/pluralize";
import {
  DEFAULT_RESOURCE_SORT_BY,
  RESOURCE_LIST_ITEMS_PER_PAGE,
  RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS,
} from "@/services/resource/constants";
import { ResourceHeaders } from "@/services/resource/ResourceHeaders";
import { RESOURCE_SEARCH_DEBOUNCE_MS } from "@/services/resource/search/constants";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useNotificationStore } from "@/store/notification";
import { useFavoriteStore } from "@/store/resource/favorite";
import { useListDialogStore } from "@/store/resource/listDialog";
import { MAX_READ_LIMIT, RoutePath, takeOne } from "@esposter/shared";

interface ResourceListViewProps {
  // When set, a close ✕ routes here (the base list closes back a layer); omitted when it sits behind a blade
  closeTo?: string;
  // The blade list box is a plain table — no toolbar, filter pills, selection, or context menu
  isSearchable?: false;
}

const { closeTo, isSearchable = true } = defineProps<ResourceListViewProps>();
const { $trpc } = useNuxtApp();
// When narrow, the toolbar commands collapse into the … overflow menu — the close ✕ never collapses
const { smAndDown } = useVDisplay();
const { getActionItems } = useResourceListActionItems();
const notificationStore = useNotificationStore();
const { createErrorNotification, createNotification } = notificationStore;
const executeDeleteResourcesMutation = useMutation();
const executeRestoreResourceMutation = useMutation();
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
const isContextMenuOpen = useSingletonDialog(contextMenuId);
const contextMenuResource = computed(() => items.value.find(({ id }) => id === contextMenuId.value));
const renamingResource = computed(() => items.value.find(({ id }) => id === renamingId.value));
const deletingResource = computed(() => items.value.find(({ id }) => id === deletingId.value));
const toolbarItems = computed<Item[]>(() => [
  {
    active: isSummaryView.value,
    icon: "mdi-view-grid-outline",
    onClick: () => {
      isSummaryView.value = !isSummaryView.value;
    },
    title: "Summary view",
  },
  {
    active: isGroupedByType.value,
    icon: "mdi-format-list-group",
    onClick: () => {
      isGroupedByType.value = !isGroupedByType.value;
    },
    title: "Group by type",
  },
  {
    icon: "mdi-file-export-outline",
    onClick: () => exportAllResourcesCsv(createResourcesPageReader()),
    title: "Export CSV",
  },
  { icon: "mdi-refresh", onClick: () => (isSummaryView.value ? refreshTypeCounts() : refresh()), title: "Refresh" },
  {
    icon: "mdi-delete-outline",
    onClick: async () => {
      await navigateTo(RoutePath.ResourcesRecycleBin);
    },
    title: "Recycle bin",
  },
]);
// Owned here because the row leaves `items` optimistically, which unmounts the v-if-gated delete dialog mid-flight
const deleteResources = async (resources: Resource[]) => {
  const snapshot = [...items.value];
  const snapshotCount = count.value;
  const ids = resources.map(({ id }) => id);
  // Read up front — the optimistic removal drops the rows before the notification fires
  const deletedNotificationTitle =
    resources.length === 1
      ? `Deleted "${takeOne(resources).name}"`
      : `Deleted ${resources.length} ${pluralize("resource", resources.length)}`;
  // The batch procedure with one id shares the exact cleanup path (row + publication + blob directory).
  // Selection accumulates across pages, so the ids are chunked to the server's per-call cap and sent in order
  await executeDeleteResourcesMutation(
    async () => {
      for (let offset = 0; offset < ids.length; offset += MAX_READ_LIMIT)
        await $trpc.resource.deleteResources.mutate({ ids: ids.slice(offset, offset + MAX_READ_LIMIT) });
    },
    {
      applyOptimistic: () => {
        const optimisticItems = items.value.filter(({ id }) => !ids.includes(id));
        items.value = optimisticItems;
        count.value -= resources.length;
        return () => {
          // A refresh, page turn or filter change mid-flight replaces `items` wholesale, so anything but our own
          // Optimistic array means the snapshot is stale and restoring it would undo the newer read
          if (items.value !== optimisticItems) return;

          items.value = snapshot;
          count.value = snapshotCount;
        };
      },
      onError: createErrorNotification,
      onSuccess: () => {
        createNotification({
          // The undo toast: a single delete is one click away from coming back, no bin trip needed
          action:
            resources.length === 1
              ? { handler: () => restoreResource(takeOne(resources)), title: "Restore" }
              : { title: "Go to Recycle bin", to: RoutePath.ResourcesRecycleBin },
          severity: "success",
          title: deletedNotificationTitle,
        });
      },
    },
  );
};
// A restore returns a Draft, so the row reappears in the list but its publication does not come back
const restoreResource = async (resource: Resource) => {
  await executeRestoreResourceMutation(() => $trpc.resource.restoreResource.mutate({ id: resource.id }), {
    onError: createErrorNotification,
    onSuccess: async () => {
      createNotification({ severity: "success", title: `Restored "${resource.name}" as a draft` });
      await refresh();
    },
  });
};
const getResourceIcon = (type: ResourceType) => ResourceDefinitionMap[type].icon;
const getResourceTitle = (type: ResourceType) => ResourceDefinitionMap[type].title;
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
      <v-toolbar px-4 py-2 b-1 b-border b-solid flex flex-wrap gap-2 items-center>
        <v-text-field
          v-model="searchInput"
          clearable
          density="comfortable"
          hide-details
          label="Search resources"
          max-width="24rem"
          min-width="12rem"
          prepend-inner-icon="mdi-magnify"
        />
        <v-spacer />
        <StyledTooltipIconButton
          v-for="{ active, icon, onClick, title } of smAndDown ? [] : toolbarItems"
          :key="title"
          :icon
          :text="title"
          :button-props="{ active }"
          @click="onClick"
        />
        <ResourceListColumnChooserMenu v-model="hiddenColumnKeys" />
        <StyledOverflowMenu v-if="smAndDown" icon="mdi-dots-horizontal" :items="toolbarItems" />
        <StyledTooltipIconButton v-if="closeTo" icon="mdi-close" text="Close" :button-props="{ to: closeTo }" />
      </v-toolbar>
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
        <div flex gap-2 items-center>
          <v-icon :icon="getResourceIcon(item.type)" />
          {{ getResourceTitle(item.type) }}
        </div>
      </template>
      <template #[`item.actions`]="{ item }">
        <!-- stop keeps the row's navigateTo from firing when the menu is opened -->
        <div @click.stop>
          <StyledOverflowMenu :items="getActionItems(item)" />
        </div>
      </template>
      <template #group-header="{ columns, isGroupOpen, item, toggleGroup }">
        <tr>
          <td :colspan="columns.length">
            <div flex gap-2 items-center>
              <v-btn
                size="small"
                variant="text"
                :icon="isGroupOpen(item) ? '$expand' : '$next'"
                @click="toggleGroup(item)"
              />
              <v-icon :icon="getResourceIcon(item.value)" />
              {{ getResourceTitle(item.value) }} ({{ item.items.length }})
            </div>
          </td>
        </tr>
      </template>
      <template #loading>
        <StyledSkeleton type="table-row@10" />
      </template>
      <template #no-data>
        <StyledEmptyState
          v-if="error"
          icon="mdi-alert-circle-outline"
          title="Something went wrong"
          :description="error"
        >
          <v-btn prepend-icon="mdi-refresh" variant="tonal" @click="refresh()">Retry</v-btn>
        </StyledEmptyState>
        <StyledEmptyState
          v-else-if="hasActiveFilters"
          icon="mdi-filter-off-outline"
          title="No resources match your filters"
          description="Try adjusting or clearing your filters."
        >
          <v-btn variant="tonal" @click="clearFilters()">Clear filters</v-btn>
        </StyledEmptyState>
        <StyledEmptyState
          v-else
          icon="mdi-folder-multiple-outline"
          title="No resources yet"
          description="Create a resource and it will show up here."
        />
      </template>
    </StyledDataTableServer>
    <ResourceListContextMenu
      v-if="isSearchable && contextMenuResource"
      v-model="isContextMenuOpen"
      :position="contextMenuPosition"
      :resource="contextMenuResource"
    />
    <!-- Outside the isSearchable gate: the blade list's row ⋮ menu opens these too -->
    <ResourceListRenameDialog
      v-if="renamingResource"
      :key="renamingResource.id"
      :resource="renamingResource"
      @update="refresh()"
    />
    <ResourceListDeleteDialog v-if="deletingResource" :resource="deletingResource" @delete="deleteResources($event)" />
  </div>
</template>
