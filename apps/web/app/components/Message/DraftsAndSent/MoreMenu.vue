<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  // The actions before Delete, which always closes the menu
  actions: Item[];
  confirmDelete: () => unknown;
  deleteLabel: string;
  deleteMessage: string;
  label: string;
}

const { actions, confirmDelete, deleteLabel, deleteMessage, label } = defineProps<Props>();
const isDeleteOpen = ref(false);
const items = computed<Item[]>(() => [
  ...actions,
  {
    isDanger: true,
    isGroupStart: true,
    meaning: UiIconMeaning.Delete,
    onClick: () => {
      isDeleteOpen.value = true;
    },
    title: deleteLabel,
  },
]);
</script>

<template>
  <UiOverflowMenu :items :label />
  <MessageDraftsAndSentDeleteConfirmDialog
    v-if="isDeleteOpen"
    v-model="isDeleteOpen"
    :title="deleteLabel"
    :confirm="confirmDelete"
  >
    <p>{{ deleteMessage }}</p>
  </MessageDraftsAndSentDeleteConfirmDialog>
</template>
