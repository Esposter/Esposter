<script setup lang="ts">
import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import type { Item } from "@/models/shared/Item";
import type { UiListItem } from "@/models/ui/UiListItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useTodoListStore } from "@/store/resource/todoList";
import { useTodoDialogStore } from "@/store/resource/todoList/todoDialog";

interface Props {
  items: UiListItem<TodoListItem["id"]>[];
  label: string;
}

const { items, label } = defineProps<Props>();
const emit = defineEmits<{ toggle: [id: TodoListItem["id"]] }>();
const todoListStore = useTodoListStore();
const { editItem } = todoListStore;
const { items: todoListItems } = storeToRefs(todoListStore);
const todoDialogStore = useTodoDialogStore();
const { deletingIds } = storeToRefs(todoDialogStore);
const { getContextMenuProps } = useContextMenu();
const checkIsCompleted = (id: TodoListItem["id"]) =>
  Boolean(todoListItems.value.find((todo) => todo.id === id)?.completedAt);
// What a todo's context menu holds: the tick its checkbox gives, and the delete its dialog also has
const getTodoItems = (id: TodoListItem["id"]): Item[] => [
  {
    meaning: UiIconMeaning.Success,
    onClick: () => emit("toggle", id),
    title: checkIsCompleted(id) ? "Mark as not completed" : "Mark as completed",
  },
  {
    isDanger: true,
    isGroupStart: true,
    meaning: UiIconMeaning.Delete,
    onClick: () => {
      deletingIds.value = [id];
    },
    title: "Delete todo",
  },
];
</script>

<!-- A todo's checkbox leads its row, beside the button that opens it rather than inside, and a right-click on the row
     Opens the menu of what else can be done to it -->
<template>
  <UiList
    :get-row-props="({ value }) => getContextMenuProps(value, () => getTodoItems(value))"
    :items
    :label
    @select="(id) => editItem({ id })"
  >
    <template #leading="{ item: { title, value } }">
      <UiCheckbox :label="title" :model-value="checkIsCompleted(value)" @update:model-value="emit('toggle', value)" />
    </template>
    <template #title="{ item: { value } }"><ResourceTodoListItemTitle :id="value" /></template>
  </UiList>
</template>
