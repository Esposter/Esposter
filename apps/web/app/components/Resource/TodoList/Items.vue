<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useTodoListStore } from "@/store/resource/todoList";
import { parse } from "node-html-parser";

const todoListStore = useTodoListStore();
const { editItem, loadContent } = todoListStore;
const { items, searchQuery } = storeToRefs(todoListStore);
// Microsoft To Do's list page: a column of rows read top to bottom in the list's own order, each opening the task's
// Detail view. A search keeps the rows whose title or notes text holds it, the notes read as text rather than markup
const listItems = computed(() => {
  const lowerCaseSearch = searchQuery.value.toLocaleLowerCase();
  const searchedItems = lowerCaseSearch
    ? items.value.filter(({ name, notes }) =>
        [name, parse(notes).textContent].some((text) => text.toLocaleLowerCase().includes(lowerCaseSearch)),
      )
    : items.value;
  // The mark's column is where the checkbox sits once a todo can be completed, so it is kept, empty, until then
  return searchedItems.map(({ id, name }): UiListItem<string> => ({ hasMarkSlot: true, title: name, value: id }));
});
await loadContent();
</script>

<template>
  <div p-4 flex flex-col gap-2 h-full ui-body>
    <ResourceTodoListTopSlot />
    <UiList v-if="listItems.length > 0" :items="listItems" label="Todos" @select="(id) => editItem({ id })">
      <template #title="{ item: { value } }"><ResourceTodoListItemTitle :id="value" /></template>
    </UiList>
    <UiEmptyState
      v-else
      :description="searchQuery ? 'Try another search' : 'Add a todo to get started'"
      :meaning="UiIconMeaning.Success"
      :title="searchQuery ? 'No todos match' : 'No todos yet'"
    />
  </div>
</template>
