<script setup lang="ts">
import type { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { useTableEditorStore } from "@/store/tableEditor";
import type { EventSourceInput } from "@fullcalendar/core";

await useReadTableEditor();
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
  <NuxtLayout>
    <v-container fluid>
      <StyledCard h-full p-4="!">
        <StyledCalendar h-full :calendar-options="{ events }" />
      </StyledCard>
    </v-container>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.v-container {
  /* Esposter App Bar 56px */
  height: calc(100dvh - 56px);
}
</style>
