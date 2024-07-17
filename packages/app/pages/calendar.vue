<script setup lang="ts">
import type { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { useTableEditorStore } from "@/store/tableEditor";
import type { EventSourceInput } from "@fullcalendar/core";

await useReadTableEditor();
const tableEditorStore = useTableEditorStore<TodoListItem>()();
const { editItem, save, resetItem } = tableEditorStore;
const { tableEditor, editedItem } = storeToRefs(tableEditorStore);
const events = computed<EventSourceInput>(() => {
  const results: EventSourceInput = [];

  for (const item of tableEditor.value.items) {
    if (!item.dueAt) continue;
    results.push({ id: item.id, title: item.name, description: item.notes, date: item.dueAt });
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
