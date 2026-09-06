<script setup lang="ts">
import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";

import { getItemCategoryDefinition } from "@/services/resource/getItemCategoryDefinition";
import { TodoListItemTypeItemCategoryDefinitions } from "@/services/resource/todoList/TodoListItemTypeItemCategoryDefinitions";

interface Props {
  item: TodoListItem;
}

const { item } = defineProps<Props>();
const itemCategoryDefinition = computed(() => getItemCategoryDefinition(TodoListItemTypeItemCategoryDefinitions, item));
</script>

<template>
  <v-chip label>
    <v-icon mr-2 :icon="itemCategoryDefinition.icon" />
    {{ itemCategoryDefinition.title }}
  </v-chip>
</template>
