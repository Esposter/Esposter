<script setup lang="ts">
import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useTodoListStore } from "#src/store/resource/todoList/index";

interface Props {
  id: TodoListItem["id"];
}

const { id } = defineProps<Props>();
const todoListStore = useTodoListStore();
const { toggleImportant } = todoListStore;
const { items: todoListItems } = storeToRefs(todoListStore);
// The todo's own lookup, held once for the button rather than run again on every render of the row
const isImportant = computed(() => Boolean(todoListItems.value.find((todo) => todo.id === id)?.isImportant));
</script>

<template>
  <UiIconButton
    :aria-pressed="isImportant"
    label="Important"
    :meaning="UiIconMeaning.Favorite"
    :variant="UiButtonVariant.Quiet"
    @click="toggleImportant(id)"
  />
</template>
