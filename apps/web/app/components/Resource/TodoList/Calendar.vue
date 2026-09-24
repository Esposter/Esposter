<script setup lang="ts">
import type { UiCalendarEvent } from "@/models/ui/UiCalendarEvent";

import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { useTodoListStore } from "@/store/resource/todoList";

const todoListStore = useTodoListStore();
const { editItem, loadContent, saveTodoList } = todoListStore;
const { editedItem, isEditFormDialogOpen, items } = storeToRefs(todoListStore);
// Only a todo with a due date is somewhere in time
const events = computed<UiCalendarEvent[]>(() =>
  items.value.flatMap(({ dueAt, id, name, notes }) =>
    dueAt ? [{ description: notes, id, start: dueAt, title: name }] : [],
  ),
);

useTodoListSubscribables();
await loadContent();
</script>

<template>
  <!-- The calendar is the page, so it takes the page's room rather than a frame inside it -->
  <div p-4 h-full ui-body>
    <UiEventCalendar
      :events
      label="Todos by due date"
      :on-create="
        (dueAt) => {
          editedItem = new TodoListItem({ dueAt });
          isEditFormDialogOpen = true;
        }
      "
      @move="
        async (id, start) => {
          const item = items.find((todoListItem) => todoListItem.id === id);
          if (!item) return;
          item.dueAt = start;
          await saveTodoList();
        }
      "
      @open="editItem({ id: $event })"
    />
    <ResourceTodoListEditDialog />
  </div>
</template>
