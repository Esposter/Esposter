<script setup lang="ts">
import type { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";

import { NOTES_MAX_LENGTH } from "#shared/services/tableEditor/todoList/constants";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore<TodoListItem>();
const { editedItem } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-container v-if="editedItem" fluid>
    <v-row>
      <TableEditorItemNameTextField v-model="editedItem.name" />
      <v-col cols="12">
        <RichTextEditor v-model="editedItem.notes" height="15rem" :limit="NOTES_MAX_LENGTH" />
      </v-col>
      <v-col cols="12">
        <StyledDatePicker
          v-model="editedItem.dueAt"
          :date-picker-props="{ placeholder: 'Due Date', sixWeeks: 'append' }"
          @cleared="editedItem.dueAt = null"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
