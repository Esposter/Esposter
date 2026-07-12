<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { useNotificationStore } from "@/store/notification";
import { getResultAsync } from "@esposter/shared";

interface ResourceListSelectionToolbarProps {
  selectedResources: Resource[];
}

const { selectedResources } = defineProps<ResourceListSelectionToolbarProps>();
const emit = defineEmits<{ clear: []; deleted: [] }>();
const { $trpc } = useNuxtApp();
const notificationStore = useNotificationStore();
const { createNotification } = notificationStore;
const { exportResourcesCsv } = useExportResourcesCsv();
// The bulk guard is the selection count, mirroring the single-delete type-the-name guard
const confirmName = computed(() => `delete ${selectedResources.length}`);
const deleteSelectedResources = () =>
  getResultAsync(() => $trpc.resource.deleteResources.mutate({ ids: selectedResources.map(({ id }) => id) })).match(
    (deletedResources) => {
      createNotification({ severity: "success", title: `Deleted ${deletedResources.length} resources` });
      emit("deleted");
    },
    (error) => {
      createNotification({ severity: "error", title: error.message });
    },
  );
</script>

<template>
  <div px-4 py-2 b-b-1 b-border b-solid flex flex-wrap gap-2 items-center>
    <span op-medium-emphasis>{{ selectedResources.length }} selected</span>
    <StyledDeleteFormDialog
      :card-props="{ title: 'Delete resources' }"
      :confirm-name
      @delete="
        async (onComplete) => {
          await deleteSelectedResources();
          onComplete();
        }
      "
    >
      <template #activator="{ updateIsOpen }">
        <v-btn color="error" prepend-icon="mdi-delete" variant="text" @click="updateIsOpen(true)">
          Delete ({{ selectedResources.length }})
        </v-btn>
      </template>
      Delete {{ selectedResources.length }} resources? This cannot be undone.
      <v-list density="compact">
        <v-list-item v-for="{ id, name } of selectedResources" :key="id" :title="name" />
      </v-list>
    </StyledDeleteFormDialog>
    <v-btn prepend-icon="mdi-file-export-outline" variant="text" @click="exportResourcesCsv(selectedResources)">
      Export CSV
    </v-btn>
    <v-spacer />
    <v-btn size="small" variant="text" @click="emit('clear')">Clear</v-btn>
  </div>
</template>
