<script setup lang="ts">
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { RESOURCE_DATE_TIME_ATTRIBUTES } from "@/services/resource/constants";
import { TodoListHeaders } from "@/services/resource/todoList/TodoListHeaders";
import { DATA_TABLE_ITEMS_PER_PAGE_OPTIONS } from "@/services/ui/constants";
import { useTodoListStore } from "@/store/resource/todoList";

const todoListStore = useTodoListStore();
const { editItem, loadContent } = todoListStore;
const { items, searchQuery } = storeToRefs(todoListStore);
const itemsPerPage = ref(DATA_TABLE_ITEMS_PER_PAGE_OPTIONS[0]);
const page = ref(1);
const sortBy = ref<SortItem<string>[]>([{ key: "name", order: SortOrder.Asc }]);
useTodoListSubscribables();
await loadContent();
</script>

<template>
  <div p-4 flex flex-col gap-2 h-full ui-body>
    <ResourceTodoListTopSlot />
    <UiDataTable
      v-model:items-per-page="itemsPerPage"
      v-model:page="page"
      v-model:sort-by="sortBy"
      :columns="TodoListHeaders"
      :get-item-title="({ name }) => name"
      :items
      :items-per-page-options="DATA_TABLE_ITEMS_PER_PAGE_OPTIONS"
      label="Todos"
      :on-open="({ id }) => editItem({ id })"
      :search="searchQuery"
      flex-1
    >
      <template #cell="{ column, item, value }">
        <ResourceTodoListItemTypeChip v-if="column.key === 'type'" :item />
        <!-- eslint-disable-next-line vue/no-v-html -- the notes are the editor's sanitized HTML -->
        <div v-else-if="column.key === 'notes'" class="rich-text-content" v-html="item.notes" />
        <NuxtTime
          v-else-if="column.key === 'dueAt' && item.dueAt"
          :="RESOURCE_DATE_TIME_ATTRIBUTES"
          :datetime="item.dueAt"
        />
        <template v-else>{{ value }}</template>
      </template>
      <template #empty>
        <UiEmptyState
          :description="searchQuery ? 'Try another search' : 'Add a todo to get started'"
          :meaning="UiIconMeaning.Success"
          :title="searchQuery ? 'No todos match' : 'No todos yet'"
        />
      </template>
    </UiDataTable>
    <ResourceTodoListEditDialog />
  </div>
</template>
