<script setup lang="ts">
import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";

import { UiToken } from "@/models/ui/UiToken";
import { getItemCategoryDefinition } from "@/services/resource/getItemCategoryDefinition";
import { TodoListItemTypeItemCategoryDefinitions } from "@/services/resource/todoList/TodoListItemTypeItemCategoryDefinitions";

interface Props {
  item: TodoListItem;
}

const { item } = defineProps<Props>();
const itemCategoryDefinition = computed(() => getItemCategoryDefinition(TodoListItemTypeItemCategoryDefinitions, item));
</script>

<template>
  <UiChip :token="UiToken.Accent">{{ itemCategoryDefinition.title }}</UiChip>
</template>
