<script setup lang="ts">
import type { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";

import { TODO_LIST_ITEM_NOTES_MAX_LENGTH } from "#shared/services/resource/item/constants";

const modelValue = defineModel<TodoListItem>({ required: true });
</script>

<template>
  <div flex flex-col gap-4>
    <ResourceTodoListItemNameTextField v-model="modelValue.name" />
    <RichTextEditor v-model="modelValue.notes" height="15rem" :limit="TODO_LIST_ITEM_NOTES_MAX_LENGTH" />
    <StyledDatePicker v-model="modelValue.dueAt" :date-picker-props="{ placeholder: 'Due Date', sixWeeks: 'append' }" />
  </div>
</template>
