<script setup lang="ts">
import type { EventSourceInput } from "@fullcalendar/vue3";

import { useTodoListStore } from "@/store/resource/todoList";

const todoListStore = useTodoListStore();
const { loadContent, saveTodoList } = todoListStore;
const { items } = storeToRefs(todoListStore);
const events = computed<EventSourceInput>(() => {
  const results: EventSourceInput = [];

  for (const item of items.value) {
    if (!item.dueAt) continue;
    results.push({ date: item.dueAt, description: item.notes, id: item.id, title: item.name });
  }

  return results;
});

useTodoListSubscribables();
// The Suspense-wrapped blade awaits the content, so it opens on a populated store and the shell's
// Skeleton covers the wait — no per-blade loading flag
await loadContent();
</script>

<template>
  <v-container fluid h-full>
    <StyledCard p-4 h-full>
      <StyledCalendar
        h-full
        :calendar-options="{
          events,
          eventChange: async ({ event: { id, start } }) => {
            const item = items.find((todoListItem) => todoListItem.id === id);
            if (!item) return;
            item.dueAt = start;
            await saveTodoList();
          },
        }"
      />
    </StyledCard>
  </v-container>
</template>
