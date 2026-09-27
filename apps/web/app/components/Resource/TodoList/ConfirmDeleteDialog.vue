<script setup lang="ts">
import { pluralize } from "#shared/util/text/pluralize";
import { useTodoListStore } from "@/store/resource/todoList";
import { useTodoDialogStore } from "@/store/resource/todoList/todoDialog";

const todoListStore = useTodoListStore();
const { deleteItems } = todoListStore;
const { items } = storeToRefs(todoListStore);
const todoDialogStore = useTodoDialogStore();
const { deletingIds } = storeToRefs(todoDialogStore);
// The todos still in the list, so one another device took away meanwhile is not deleted from behind the dialog
const { isOpen, item: deletingItems } = useSingletonDialog(deletingIds, () =>
  items.value.filter(({ id }) => deletingIds.value.includes(id)),
);
</script>

<!-- Nothing in the list brings a deleted todo back, so the answer names how many go -->
<template>
  <UiConfirmDialog
    v-if="deletingItems?.length"
    v-model="isOpen"
    :confirm-label="
      deletingItems.length === 1
        ? 'Delete'
        : `Delete ${deletingItems.length} ${pluralize('todo', deletingItems.length)}`
    "
    :title="deletingItems.length === 1 ? 'Delete todo' : 'Delete todos'"
    :confirm="() => deletingItems && deleteItems(deletingItems.map(({ id }) => id))"
    is-optimistic
  >
    <p>
      Delete
      {{
        deletingItems.length === 1
          ? deletingItems[0]?.name
          : `${deletingItems.length} ${pluralize("todo", deletingItems.length)}`
      }}? This can't be undone.
    </p>
  </UiConfirmDialog>
</template>
