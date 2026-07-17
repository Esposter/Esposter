<script setup lang="ts">
import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";
import type { Item } from "@/models/shared/Item";
import type { Resource, ResourceType } from "@esposter/db-schema";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import { ResourceDefinitionMap } from "#shared/services/resource/ResourceDefinitionMap";
import { DeletedResourceHeaders } from "@/services/resource/DeletedResourceHeaders";
import { RESOURCE_LIST_ITEMS_PER_PAGE, RESOURCE_LIST_ITEMS_PER_PAGE_OPTIONS } from "@/services/resource/constants";
import { useNotificationStore } from "@/store/notification";
import { useRecycleBinDialogStore } from "@/store/resource/recycleBinDialog";
import { RECYCLE_BIN_RETENTION_DAYS } from "@esposter/db";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });
const { $trpc } = useNuxtApp();
const notificationStore = useNotificationStore();
const { createNotification } = notificationStore;
const executeRestoreMutation = useMutation();
const executePurgeMutation = useMutation();
const { count, error, isLoading, items, readDeletedResources, refresh } = useReadDeletedResources();
const recycleBinDialogStore = useRecycleBinDialogStore();
const { purgingId } = storeToRefs(recycleBinDialogStore);
const purgingResource = computed(() => items.value.find(({ id }) => id === purgingId.value));
const restore = async (resource: Resource) => {
  await executeRestoreMutation(() => $trpc.resource.restoreResource.mutate({ id: resource.id }), {
    onError: (restoreError) => {
      createNotification({ severity: "error", title: restoreError.message });
    },
    onSuccess: async () => {
      createNotification({
        action: { title: "Go to resource", to: RoutePath.Resource(resource.id) },
        severity: "success",
        // A restore returns a Draft — saying so up front beats a surprise when the public link 404s
        title: `Restored "${resource.name}" as a draft`,
      });
      await refresh();
    },
  });
};
const purge = async (resource: Resource) => {
  await executePurgeMutation(() => $trpc.resource.purgeResource.mutate({ id: resource.id }), {
    onError: (purgeError) => {
      createNotification({ severity: "error", title: purgeError.message });
    },
    onSuccess: async () => {
      createNotification({ severity: "success", title: `Permanently deleted "${resource.name}"` });
      await refresh();
    },
  });
};
const getActionItems = (resource: Resource): Item[] => [
  { icon: "mdi-restore", onClick: () => restore(resource), title: "Restore" },
  {
    color: "error",
    icon: "mdi-delete-forever",
    onClick: () => {
      purgingId.value = resource.id;
    },
    title: "Delete forever",
  },
];
const getResourceIcon = (type: ResourceType) => ResourceDefinitionMap[type].icon;
const getResourceTitle = (type: ResourceType) => ResourceDefinitionMap[type].title;
const onUpdateOptions = (options: ReadResourcesOptions) => readDeletedResources(options);
</script>

<template>
  <NuxtLayout>
    <Head>
      <Title>Recycle Bin</Title>
    </Head>
    <div flex flex-col h-full>
      <StyledPageHeader title="Recycle bin">
        <template #breadcrumbs>
          <AppBreadcrumbs :crumbs="[{ title: 'All', to: RoutePath.ResourcesAll }]" title="Recycle bin" />
        </template>
      </StyledPageHeader>
      <v-sheet flex flex-1 flex-col min-w-0>
        <v-toolbar px-4 py-2 b-1 b-border b-solid flex gap-2 items-center>
          <span op-medium-emphasis
            >Deleted resources are permanently removed after {{ RECYCLE_BIN_RETENTION_DAYS }} days.</span
          >
          <v-spacer />
          <StyledTooltipIconButton icon="mdi-refresh" text="Refresh" @click="refresh()" />
          <StyledTooltipIconButton icon="mdi-close" text="Close" :button-props="{ to: RoutePath.ResourcesAll }" />
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
            <div flex gap-2 items-center>
              <v-icon :icon="getResourceIcon(item.type)" />
              {{ getResourceTitle(item.type) }}
            </div>
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
      </v-sheet>
    </div>
    <ResourcePurgeDialog v-if="purgingResource" :resource="purgingResource" @purge="purge($event)" />
  </NuxtLayout>
</template>
