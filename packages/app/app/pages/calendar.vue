<script setup lang="ts">
import type { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import type { EventSourceInput } from "@fullcalendar/core";

import { useTableEditorStore } from "@/store/tableEditor";

await useReadTableEditor();
const tableEditorStore = useTableEditorStore<TodoListItem>();
const { editItem, resetItem, save } = tableEditorStore;
const { editedItem, tableEditor } = storeToRefs(tableEditorStore);
const events = computed<EventSourceInput>(() => {
  const results: EventSourceInput = [];

  for (const item of tableEditor.value.items) {
    if (!item.dueAt) continue;
    results.push({ date: item.dueAt, description: item.notes, id: item.id, title: item.name });
  }

  return results;
});
</script>

<template>
  <NuxtLayout>
    <v-container fluid>
      <StyledCard h-full p-4="!">
        <StyledCalendar
          h-full
          :calendar-options="{
            events,
            eventChange: async ({ event: { id, start } }) => {
              await editItem(id);
              if (!editedItem) return;
              editedItem.dueAt = start;
              await save();
              await resetItem();
            },
          }"
        />
      </StyledCard>
    </v-container>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.v-container {
  height: calc(100dvh - $app-bar-height);
}
</style>
