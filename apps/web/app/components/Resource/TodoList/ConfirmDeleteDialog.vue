<script setup lang="ts">
import { pluralize } from "#shared/util/text/pluralize";
import { useTodoListStore } from "#src/store/resource/todoList/index";
import { useTodoDialogStore } from "#src/store/resource/todoList/todoDialog";

const todoListStore = useTodoListStore();
const { deleteItems } = todoListStore;
const { items } = storeToRefs(todoListStore);
const todoDialogStore = useTodoDialogStore();
const { deletingIds } = storeToRefs(todoDialogStore);
// The todos still in the list, so one another device took away meanwhile is not deleted from behind the dialog
const { isOpen, item: deletingItems } = useSingletonDialog(deletingIds, () =>
  items.value.filter(({ id }) => deletingIds.value.includes(id)),
);
const deletingCount = computed(() => deletingItems.value?.length ?? 0);
const isSingleTodo = computed(() => deletingCount.value === 1);
const deletingCountText = computed(() => `${deletingCount.value} ${pluralize("todo", deletingCount.value)}`);
</script>

<!-- Nothing in the list brings a deleted todo back, so the answer names how many go -->
<template>
  <UiConfirmDialog
    v-if="deletingItems?.length"
    v-model="isOpen"
    :confirm-label="isSingleTodo ? 'Delete' : `Delete ${deletingCountText}`"
    :title="isSingleTodo ? 'Delete todo' : 'Delete todos'"
    :confirm="() => deletingItems && deleteItems(deletingItems.map(({ id }) => id))"
  >
    <p>
      Delete
      {{ isSingleTodo ? deletingItems[0]?.name : deletingCountText }}? This can't be undone.
    </p>
  </UiConfirmDialog>
</template>
