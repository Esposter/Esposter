<script setup lang="ts" generic="TItem extends Item">
import type { Item } from "@/models/tableEditor/Item";
import { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import type { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { TodoListItemType } from "@/models/tableEditor/todoList/TodoListItemType";
import { GetEditFormMap } from "@/services/tableEditor/constants";
import { useTableEditorStore } from "@/store/tableEditor";

interface CrudViewHeaderProps {
  itemCategoryDefinitions: ItemCategoryDefinition<TItem>[];
}

const props = defineProps<CrudViewHeaderProps>();
const { itemCategoryDefinitions } = toRefs(props);
const tableEditorStore = useTableEditorStore<TodoListItem>()();
const { searchQuery, editedItem } = storeToRefs(tableEditorStore);
const component = computed(() =>
  editedItem.value ? GetEditFormMap(TodoListItemType.Todo)[editedItem.value.type] : null
);
</script>

<template>
  <v-toolbar pr="4" color="surface">
    <v-toolbar-title>Table Editor</v-toolbar-title>
    <v-text-field v-model="searchQuery" append-inner-icon="mdi-magnify" label="Search" hide-details />
    <v-divider mx="4!" thickness="2" inset vertical />
    <TableEditorCreateItemButton :item-category-definitions="itemCategoryDefinitions" />
    <TableEditorEditFormDialog>
      <component :is="component" v-if="editedItem" />
    </TableEditorEditFormDialog>
  </v-toolbar>
</template>
