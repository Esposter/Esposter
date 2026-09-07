<script setup lang="ts">
import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";
import type { Item } from "@/models/shared/Item";
import type { Resource } from "@esposter/db-schema";

import { RESOURCE_LIST_ITEMS_PER_PAGE, RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS } from "@/services/resource/constants";
import { DeletedResourceHeaders } from "@/services/resource/DeletedResourceHeaders";
import { useNavigationTrailStore } from "@/store/navigationTrail";
import { useRecycleBinDialogStore } from "@/store/resource/recycleBinDialog";
import { RECYCLE_BIN_RETENTION_DAYS } from "@esposter/db-schema";

// A row is always in the map it was built from, so this only satisfies the lookup type — bound as a module constant
// So the fallback cannot allocate per render
const NO_ACTION_ITEMS: Item[] = [];

const { count, error, isPending, items, readDeletedResources, refresh } = useReadDeletedResources();
const navigationTrailStore = useNavigationTrailStore();
const { closeTo } = storeToRefs(navigationTrailStore);
const recycleBinDialogStore = useRecycleBinDialogStore();
const { purgingId } = storeToRefs(recycleBinDialogStore);
const purgingResource = computed(() => items.value.find(({ id }) => id === purgingId.value));
const { checkIsRestorePending, restoreResource } = useRestoreResource(refresh);
const purgeResource = usePurgeResource(refresh);
const getActionItems = (resource: Resource): Item[] => [
  {
    disabled: checkIsRestorePending(resource.id),
    icon: "mdi-restore",
    onClick: () => restoreResource(resource),
    title: "Restore",
  },
  {
    color: "error",
    icon: "mdi-delete-forever",
    onClick: () => {
      purgingId.value = resource.id;
    },
    title: "Delete forever",
  },
];
// One build per page rather than one per row per render — the row ⋮ menu binds an array of closures, so rebuilding
// It inline hands the menu a new identity on every parent render
const resourceIdActionItemsMap = computed(() => new Map(items.value.map((item) => [item.id, getActionItems(item)])));
const onUpdateOptions = (options: ReadResourcesOptions) => readDeletedResources(options);
</script>

<template>
  <v-sheet flex flex-1 flex-col min-w-0>
    <v-toolbar px-4 py-2 b-1 b-border b-solid flex gap-2 items-center>
      <span op-medium-emphasis
        >Deleted resources are permanently removed after {{ RECYCLE_BIN_RETENTION_DAYS }} days.</span
      >
      <v-spacer />
      <StyledTooltipIconButton icon="mdi-refresh" text="Refresh" @click="refresh()" />
      <StyledTooltipIconButton :to="closeTo" icon="mdi-close" text="Close" />
    </v-toolbar>
    <v-alert v-if="error && items.length > 0" density="compact" type="error" :text="error" :rounded="0">
      <template #append>
        <v-btn size="small" variant="text" @click="refresh()">Retry</v-btn>
      </template>
    </v-alert>
    <v-data-table-server
      flex
      flex-1
      flex-col
      height="100%"
      item-value="id"
      :headers="DeletedResourceHeaders"
      :items
      :items-length="count"
      :items-per-page="RESOURCE_LIST_ITEMS_PER_PAGE"
      :items-per-page-options="RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS"
      :loading="isPending"
      @update:options="onUpdateOptions"
    >
      <template #[`item.type`]="{ item }">
        <ResourceListTypeCell :type="item.type" />
      </template>
      <template #[`item.actions`]="{ item }">
        <StyledOverflowMenu :items="resourceIdActionItemsMap.get(item.id) ?? NO_ACTION_ITEMS" />
      </template>
      <template #loading>
        <StyledSkeleton type="table-row@10" />
      </template>
      <template #no-data>
        <StyledErrorState v-if="error" :error @retry="refresh()" />
        <StyledEmptyState
          v-else
          icon="mdi-delete-outline"
          title="Recycle bin is empty"
          :description="`Deleted resources appear here for ${RECYCLE_BIN_RETENTION_DAYS} days before they are permanently removed.`"
        />
      </template>
    </v-data-table-server>
    <ResourcePurgeDialog v-if="purgingResource" :resource="purgingResource" @purge="purgeResource($event)" />
  </v-sheet>
</template>
