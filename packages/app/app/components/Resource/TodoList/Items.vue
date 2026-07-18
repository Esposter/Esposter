<script setup lang="ts">
import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import { getItemCategoryDefinition } from "@/services/resource/getItemCategoryDefinition";
import { TodoListHeaders } from "@/services/resource/todoList/TodoListHeaders";
import { TodoListItemTypeItemCategoryDefinitions } from "@/services/resource/todoList/TodoListItemTypeItemCategoryDefinitions";
import { useTodoListStore } from "@/store/resource/todoList";

const todoListStore = useTodoListStore();
const { editItem, loadContent } = todoListStore;
const { items, searchQuery } = storeToRefs(todoListStore);
const isLoading = ref(true);
const onClickRow = (_event: MouseEvent, { item }: ItemSlot<TodoListItem>) => editItem({ id: item.id });
useTodoListSubscribables();

onMounted(async () => {
  await loadContent();
  isLoading.value = false;
});
</script>

<template>
  <StyledSkeleton v-if="isLoading" />
  <v-container v-else fluid flex flex-col h-full>
    <StyledDataTable
      flex
      flex-1
      flex-col
      :data-table-props="{
        height: '100%',
        headers: TodoListHeaders,
        items,
        search: searchQuery,
        sortBy: [{ key: 'name', order: 'asc' }],
      }"
      @click:row="onClickRow"
    >
      <template #top>
        <ResourceTodoListTopSlot />
      </template>
      <template #[`item.type`]="{ item }">
        <v-chip label>
          <v-icon pr-2 :icon="getItemCategoryDefinition(TodoListItemTypeItemCategoryDefinitions, item).icon" />
          {{ getItemCategoryDefinition(TodoListItemTypeItemCategoryDefinitions, item).title }}
        </v-chip>
      </template>
      <template #[`item.notes`]="{ item }">
        <div class="rich-text-content" v-html="item.notes" />
      </template>
    </StyledDataTable>
    <ResourceTodoListEditDialog />
  </v-container>
</template>
