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
  <!-- A kind read as its mark and name, as the table's other cells read, rather than a chip set into the row -->
  <span flex gap-2 items-center>
    <span :class="itemCategoryDefinition.icon" aria-hidden="true" text-accent shrink-0 size-6 />
    {{ itemCategoryDefinition.title }}
  </span>
</template>
