<script setup lang="ts">
import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";
import type { Item } from "@/models/shared/Item";
import type { Resource } from "@esposter/db-schema";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import { RESOURCE_LIST_ITEMS_PER_PAGE, RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS } from "@/services/resource/constants";
import { DeletedResourceHeaders } from "@/services/resource/DeletedResourceHeaders";
import { useRecycleBinDialogStore } from "@/store/resource/recycleBinDialog";
import { RECYCLE_BIN_RETENTION_DAYS } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

const { count, error, isLoading, items, readDeletedResources, refresh } = useReadDeletedResources();
const recycleBinDialogStore = useRecycleBinDialogStore();
const { purgingId } = storeToRefs(recycleBinDialogStore);
const purgingResource = computed(() => items.value.find(({ id }) => id === purgingId.value));
const { getIsRestorePending, restoreResource } = useRestoreResource(refresh);
const purgeResource = usePurgeResource(refresh);
const getActionItems = (resource: Resource): Item[] => [
  {
    disabled: getIsRestorePending(resource.id),
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
      <StyledTooltipIconButton :to="RoutePath.ResourcesAll" icon="mdi-close" text="Close" />
    </v-toolbar>
    <v-alert v-if="error && items.length > 0" density="compact" type="error" :text="error" :rounded="0">
      <template #append>
        <v-btn size="small" variant="text" @click="refresh()">Retry</v-btn>
      </template>
    </v-alert>
    <StyledDataTableServer
      flex
      flex-1
      flex-col
      :data-table-server-props="{
        headers: DeletedResourceHeaders,
        height: '100%',
        items,
        itemsLength: count,
        itemsPerPageOptions: RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS,
        itemsPerPage: RESOURCE_LIST_ITEMS_PER_PAGE,
        itemValue: 'id',
        loading: isLoading,
      }"
      @update:options="onUpdateOptions"
    >
      <template #[`item.type`]="{ item }: ItemSlot<Resource>">
        <ResourceListTypeCell :type="item.type" />
      </template>
      <template #[`item.actions`]="{ item }: ItemSlot<Resource>">
        <StyledOverflowMenu :items="getActionItems(item)" />
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
          v-else
          icon="mdi-delete-outline"
          title="Recycle bin is empty"
          :description="`Deleted resources appear here for ${RECYCLE_BIN_RETENTION_DAYS} days before they are permanently removed.`"
        />
      </template>
    </StyledDataTableServer>
    <ResourcePurgeDialog v-if="purgingResource" :resource="purgingResource" @purge="purgeResource($event)" />
  </v-sheet>
</template>
