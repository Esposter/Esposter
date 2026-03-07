<script setup lang="ts">
import type { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";

import { NOTES_MAX_LENGTH } from "#shared/services/tableEditor/todoList/constants";

const modelValue = defineModel<TodoListItem>({ required: true });
</script>

<template>
  <v-row>
    <TableEditorItemNameTextField v-model="modelValue.name" />
    <v-col cols="12">
      <RichTextEditor v-model="modelValue.notes" height="15rem" :limit="NOTES_MAX_LENGTH" />
    </v-col>
    <v-col cols="12">
      <StyledDatePicker
        v-model="modelValue.dueAt"
        :date-picker-props="{ placeholder: 'Due Date', sixWeeks: 'append' }"
        @cleared="modelValue.dueAt = null"
      />
    </v-col>
  </v-row>
</template>
