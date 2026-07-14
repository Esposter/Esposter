<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { useNotificationStore } from "@/store/notification";
import { takeOne } from "@esposter/shared";

interface ResourceListSelectionToolbarProps {
  selectedResources: Resource[];
}

const { selectedResources } = defineProps<ResourceListSelectionToolbarProps>();
const emit = defineEmits<{ clear: []; delete: [] }>();
const { $trpc } = useNuxtApp();
const executeMutation = useMutation();
const notificationStore = useNotificationStore();
const { createNotification } = notificationStore;
const { exportResourcesCsv } = useExportResourcesCsv();
const selectedLabel = computed(() => `${selectedResources.length} ${pluralize("resource", selectedResources.length)}`);
// One selection guards on the name, matching the row and blade delete dialogs;
// Past one no single name identifies the set, so the guard falls back to the count phrase
const confirmName = computed(() =>
  selectedResources.length === 1 ? takeOne(selectedResources).name : `Delete ${selectedLabel.value}`,
);
</script>

<template>
  <div px-4 py-2 b-b-1 b-border b-solid flex flex-wrap gap-2 items-center>
    <span op-medium-emphasis>{{ selectedResources.length }} selected</span>
    <StyledDeleteFormDialog
      :card-props="{ title: `Delete ${selectedLabel}` }"
      :confirm-name
      @delete="
        async (onComplete) => {
          let isSuccessful = false;
          await executeMutation(
            () => $trpc.resource.deleteResources.mutate({ ids: selectedResources.map(({ id }) => id) }),
            {
              onError: (error) => {
                createNotification({ severity: 'error', title: error.message });
              },
              onSuccess: (deletedResources) => {
                createNotification({
                  severity: 'success',
                  title: `Deleted ${deletedResources.length} ${pluralize('resource', deletedResources.length)}`,
                });
                emit('delete');
                isSuccessful = true;
              },
            },
          );
          onComplete(isSuccessful);
        }
      "
    >
      <template #activator="{ updateIsOpen }">
        <v-btn color="error" prepend-icon="mdi-delete" variant="text" @click="updateIsOpen(true)">
          Delete ({{ selectedResources.length }})
        </v-btn>
      </template>
      Delete {{ selectedLabel }}? This cannot be undone.
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
