<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { RECYCLE_BIN_RETENTION_DAYS } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";

interface Props {
  selectedResources: Resource[];
}

const { selectedResources } = defineProps<Props>();
const emit = defineEmits<{ delete: [resources: Resource[]] }>();
const selectedLabel = computed(() => `${selectedResources.length} ${pluralize("resource", selectedResources.length)}`);
const cardProps = computed(() => ({ title: `Delete ${selectedLabel.value}` }));
</script>

<template>
  <!-- One selection guards on the name, matching the row and blade delete dialogs;
    past one no single name identifies the set, so the guard falls back to the count phrase -->
  <StyledDeleteFormDialog
    :card-props
    :confirm-name="selectedResources.length === 1 ? takeOne(selectedResources).name : `Delete ${selectedLabel}`"
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
    Deleting {{ selectedLabel }} moves them to the Recycle bin for {{ RECYCLE_BIN_RETENTION_DAYS }} days.
    <v-list density="compact">
      <v-list-item v-for="{ id, name } of selectedResources" :key="id" :title="name" />
    </v-list>
  </StyledDeleteFormDialog>
</template>
