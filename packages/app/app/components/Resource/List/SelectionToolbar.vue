<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { takeOne } from "@esposter/shared";

interface ResourceListSelectionToolbarProps {
  selectedResources: Resource[];
}

const { selectedResources } = defineProps<ResourceListSelectionToolbarProps>();
const emit = defineEmits<{ clear: []; delete: [resources: Resource[]] }>();
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
        (onComplete) => {
          onComplete();
          emit('delete', selectedResources);
        }
      "
    >
      <template #activator="{ updateIsOpen }">
        <v-btn color="error" prepend-icon="mdi-delete" variant="text" @click="updateIsOpen(true)">
          Delete ({{ selectedResources.length }})
        </v-btn>
      </template>
      Deleting {{ selectedLabel }} moves them to the Recycle bin for 30 days.
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
