<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { RECYCLE_BIN_RETENTION_DAYS } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";

interface Props {
  selectedResources: Resource[];
}

const { selectedResources } = defineProps<Props>();
const emit = defineEmits<{ delete: [resources: Resource[]] }>();
const isOpen = ref(false);
const selectedLabel = computed(() => `${selectedResources.length} ${pluralize("resource", selectedResources.length)}`);
</script>

<template>
  <UiButton :variant="UiButtonVariant.Danger" @click="isOpen = true">Delete ({{ selectedResources.length }})</UiButton>
  <!-- One selection guards on the name, matching the row and page delete dialogs;
    past one no single name identifies the set, so the guard falls back to the count phrase -->
  <UiConfirmDialog
    v-model="isOpen"
    confirm-label="Delete"
    :confirm-name="selectedResources.length === 1 ? takeOne(selectedResources).name : `Delete ${selectedLabel}`"
    :title="`Delete ${selectedLabel}`"
    @confirm="
      (onComplete) => {
        onComplete();
        emit('delete', selectedResources);
      }
    "
  >
    <p>Deleting {{ selectedLabel }} moves them to the Recycle bin for {{ RECYCLE_BIN_RETENTION_DAYS }} days.</p>
    <ul>
      <li v-for="{ id, name } of selectedResources" :key="id">{{ name }}</li>
    </ul>
  </UiConfirmDialog>
</template>
