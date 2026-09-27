<script setup lang="ts">
import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import type { Item } from "@/models/shared/Item";
import type { UiListItem } from "@/models/ui/UiListItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { TODO_COMPLETION_HOLD_MS } from "@/services/resource/constants";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useResourceStore } from "@/store/resource";
import { useTodoListStore } from "@/store/resource/todoList";
import { useTodoDialogStore } from "@/store/resource/todoList/todoDialog";
import { promiseTimeout } from "@vueuse/core";
import { parse } from "node-html-parser";

const resourceStore = useResourceStore();
const { currentResourceId } = storeToRefs(resourceStore);
const todoListStore = useTodoListStore();
const { loadContent, toggleCompleted } = todoListStore;
const { items, searchQuery } = storeToRefs(todoListStore);
const todoDialogStore = useTodoDialogStore();
const { deletingIds } = storeToRefs(todoDialogStore);
const isCompletedCollapsed = useLocalStorage(
  () => LocalStorageKey.TodoListCompletedCollapsed(currentResourceId.value),
  false,
);
const isCompletedOpen = computed({
  get: () => !isCompletedCollapsed.value,
  set: (newIsCompletedOpen) => {
    isCompletedCollapsed.value = !newIsCompletedOpen;
  },
});
// A ticked todo holds its place, struck through, before it moves under Completed, so the tick is seen to land first
const holdingIds = ref(new Set<TodoListItem["id"]>());
const searchedItems = computed(() => {
  const lowerCaseSearch = searchQuery.value.toLocaleLowerCase();
  // The notes are read as text rather than markup, so a search for "p" does not match every paragraph
  return lowerCaseSearch
    ? items.value.filter(({ name, notes }) =>
        [name, parse(notes).textContent].some((text) => text.toLocaleLowerCase().includes(lowerCaseSearch)),
      )
    : items.value;
});
const toListItem = ({ id, name }: TodoListItem): UiListItem<string> => ({
  hasLeadingSlot: true,
  title: name,
  value: id,
});
// Open todos in the list's own order; completed ones at the foot, the newest completion first
const openListItems = computed(() =>
  searchedItems.value
    .filter(({ completedAt, id }) => !completedAt || holdingIds.value.has(id))
    .map((item) => toListItem(item)),
);
const completedListItems = computed(() =>
  searchedItems.value
    .filter(({ completedAt, id }) => completedAt && !holdingIds.value.has(id))
    .toSorted(
      (firstItem, secondItem) => (secondItem.completedAt?.getTime() ?? 0) - (firstItem.completedAt?.getTime() ?? 0),
    )
    .map((item) => toListItem(item)),
);
const checkIsCompleted = (id: TodoListItem["id"]) => Boolean(items.value.find((item) => item.id === id)?.completedAt);
const toggle = async (id: TodoListItem["id"]) => {
  const isCompleting = !checkIsCompleted(id);
  // An untick during the hold cancels the move, since the todo it was holding is open again
  if (isCompleting) holdingIds.value.add(id);
  else holdingIds.value.delete(id);
  await toggleCompleted(id);
  if (!isCompleting) return;

  await promiseTimeout(TODO_COMPLETION_HOLD_MS);
  holdingIds.value.delete(id);
};
const completedActions = computed<Item[]>(() => [
  {
    isDanger: true,
    meaning: UiIconMeaning.Delete,
    // The completed todos the heading counts, so under a search it never deletes one the list is not showing
    onClick: () => {
      deletingIds.value = completedListItems.value.map(({ value }) => value);
    },
    title: "Delete completed",
  },
]);
await loadContent();
</script>

<template>
  <div p-4 flex flex-col gap-2 h-full of-y-auto ui-body>
    <ResourceTodoListTopSlot />
    <template v-if="openListItems.length > 0 || completedListItems.length > 0">
      <ResourceTodoListRows
        v-if="openListItems.length > 0"
        :items="openListItems"
        label="Todos"
        @toggle="(id) => toggle(id)"
      />
      <UiCollapsible v-if="completedListItems.length > 0" v-model="isCompletedOpen">
        <template #title>Completed · {{ completedListItems.length }}</template>
        <template #actions><UiOverflowMenu :items="completedActions" label="Completed actions" /></template>
        <ResourceTodoListRows :items="completedListItems" label="Completed todos" @toggle="(id) => toggle(id)" />
      </UiCollapsible>
    </template>
    <UiEmptyState
      v-else
      :description="searchQuery ? 'Try another search' : 'Add a todo to get started'"
      :meaning="UiIconMeaning.Success"
      :title="searchQuery ? 'No todos match' : 'No todos yet'"
    />
    <ResourceTodoListConfirmDeleteDialog />
  </div>
</template>
