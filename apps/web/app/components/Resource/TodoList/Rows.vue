<script setup lang="ts">
import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import type { Item } from "@/models/shared/Item";
import type { UiListItem } from "@/models/ui/UiListItem";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useTodoListStore } from "@/store/resource/todoList";
import { useTodoDialogStore } from "@/store/resource/todoList/todoDialog";

interface Props {
  isReorderable?: true;
  items: UiListItem<TodoListItem["id"]>[];
  label: string;
}

const { isReorderable, items, label } = defineProps<Props>();
const emit = defineEmits<{ toggle: [id: TodoListItem["id"]] }>();
const todoListStore = useTodoListStore();
const { editItem, reorderItems, toggleImportant } = todoListStore;
const { items: todoListItems } = storeToRefs(todoListStore);
const todoDialogStore = useTodoDialogStore();
const { deletingIds } = storeToRefs(todoDialogStore);
const { getContextMenuProps } = useContextMenu();
const findItem = (id: TodoListItem["id"]) => todoListItems.value.find((todo) => todo.id === id);
const checkIsCompleted = (id: TodoListItem["id"]) => Boolean(findItem(id)?.completedAt);
const checkIsImportant = (id: TodoListItem["id"]) => Boolean(findItem(id)?.isImportant);
// What a todo's context menu holds: the tick its checkbox gives, the star it trails, and the delete its dialog also has
const getTodoItems = (id: TodoListItem["id"]): Item[] => [
  {
    meaning: UiIconMeaning.Success,
    onClick: () => emit("toggle", id),
    title: checkIsCompleted(id) ? "Mark as not completed" : "Mark as completed",
  },
  {
    meaning: UiIconMeaning.Favorite,
    onClick: async () => {
      await toggleImportant(id);
    },
    title: checkIsImportant(id) ? "Remove importance" : "Mark as important",
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

<!-- A todo's checkbox leads its row and its star trails it, each beside the button that opens it rather than inside,
     And a right-click on the row opens the menu of what else can be done to it. The star is a toggle keeping one name,
     Filled in the accent while the todo is important -->
<template>
  <UiList
    :get-row-props="({ value }) => getContextMenuProps(value, () => getTodoItems(value))"
    :is-reorderable
    :items
    :label
    @reorder="(ids) => reorderItems(ids)"
    @select="(id) => editItem({ id })"
  >
    <template #leading="{ item: { title, value } }">
      <UiCheckbox :label="title" :model-value="checkIsCompleted(value)" @update:model-value="emit('toggle', value)" />
    </template>
    <template #title="{ item: { value } }"><ResourceTodoListItemTitle :id="value" /></template>
    <template #actions="{ item: { value } }">
      <UiIconButton
        :aria-pressed="checkIsImportant(value)"
        label="Important"
        :meaning="UiIconMeaning.Favorite"
        :variant="UiButtonVariant.Quiet"
        @click="toggleImportant(value)"
      />
    </template>
  </UiList>
</template>
