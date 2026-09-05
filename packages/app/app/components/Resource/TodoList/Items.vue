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
const onClickRow = (_event: MouseEvent, { item }: ItemSlot<TodoListItem>) => editItem({ id: item.id });
useTodoListSubscribables();
await loadContent();
</script>

<template>
  <v-container fluid flex flex-col h-full>
    <v-data-table
      flex
      flex-1
      flex-col
      height="100%"
      :headers="TodoListHeaders"
      :items
      :search="searchQuery"
      :sort-by="[{ key: 'name', order: 'asc' }]"
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
    </v-data-table>
    <ResourceTodoListEditDialog />
  </v-container>
</template>
