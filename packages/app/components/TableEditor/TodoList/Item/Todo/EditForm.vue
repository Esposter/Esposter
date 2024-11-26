<script setup lang="ts">
import type { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";

import { formRules } from "@/services/vuetify/formRules";
import { useTableEditorStore } from "@/store/tableEditor";
import { NOTES_MAX_LENGTH } from "~/shared/services/tableEditor/todoList/constants";

const tableEditorStore = useTableEditorStore<TodoListItem>();
const { editedItem } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-container v-if="editedItem" fluid>
    <v-row>
      <v-col cols="12">
        <v-text-field v-model="editedItem.name" label="Name" :rules="[formRules.required]" />
      </v-col>
      <v-col cols="12">
        <RichTextEditor v-model="editedItem.notes" :limit="NOTES_MAX_LENGTH" />
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
