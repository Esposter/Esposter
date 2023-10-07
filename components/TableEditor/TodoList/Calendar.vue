<script setup lang="ts">
import type { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { useTableEditorStore } from "@/store/tableEditor";
import type { EventSourceInput } from "@fullcalendar/core";

const tableEditorStore = useTableEditorStore<TodoListItem>()();
const { tableEditor, editedItem } = storeToRefs(tableEditorStore);
const events = computed<EventSourceInput>(() => {
  // There are 3 cases:
  // 1. Editing a new item
  // 2. Editing an existing item
  // 3. Viewing the calendar
  const results: EventSourceInput = [];
  if (editedItem.value?.dueAt)
    results.push({
      id: editedItem.value.id,
      title: editedItem.value.name,
      description: editedItem.value.notes,
      date: editedItem.value.dueAt,
    });

  for (const item of tableEditor.value.items) {
    if (!item.dueAt) continue;
    if (item.id !== editedItem.value?.id)
      results.push({ id: item.id, title: item.name, description: item.notes, date: item.dueAt });
  }

  return results;
});
</script>

<template>
  <StyledCalendar :calendar-options="{ events }" />
</template>
