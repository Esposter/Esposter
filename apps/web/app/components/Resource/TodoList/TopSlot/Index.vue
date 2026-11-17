<script setup lang="ts">
import type { Item } from "#src/models/shared/Item";

import { TodoListSort } from "#src/models/resource/todoList/TodoListSort";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { UiTextFieldType } from "#src/models/ui/UiTextFieldType";
import { TodoListSortLabelMap } from "#src/services/resource/todoList/TodoListSortLabelMap";
import { TodoListSortMeaningMap } from "#src/services/resource/todoList/TodoListSortMeaningMap";
import { useTodoListStore } from "#src/store/resource/todoList/index";

const todoListStore = useTodoListStore();
const { searchQuery, sort } = storeToRefs(todoListStore);
const isSearchOpen = ref(false);
// The sorts as a group of radios, so the one the viewer has shows as soon as the menu opens
const sortItems = computed<Item[]>(() =>
  Object.values(TodoListSort).map((todoListSort) => ({
    isSelected: todoListSort === sort.value,
    meaning: TodoListSortMeaningMap[todoListSort],
    onClick: () => {
      sort.value = todoListSort;
    },
    title: TodoListSortLabelMap[todoListSort],
  })),
);
</script>

<!-- Search stays a button beside the add field until it is opened or holds a query, when its field sits beside this one -->
<template>
  <div flex gap-2 items-center>
    <ResourceTodoListTopSlotAddForm />
    <div
      v-if="isSearchOpen || searchQuery"
      flex-1
      min-w-0
      @focusout="isSearchOpen = false"
      @keydown.esc="searchQuery = ''"
    >
      <UiTextField v-model="searchQuery" is-autofocus label="Search todos" :type="UiTextFieldType.Search" />
    </div>
    <UiIconButton
      v-else
      label="Search todos"
      :meaning="UiIconMeaning.Search"
      :variant="UiButtonVariant.Quiet"
      @click="isSearchOpen = true"
    />
    <UiOverflowMenu :items="sortItems" label="Sort" :meaning="UiIconMeaning.SortAscending" />
    <ResourceTodoListConnectAgentButton />
  </div>
</template>
