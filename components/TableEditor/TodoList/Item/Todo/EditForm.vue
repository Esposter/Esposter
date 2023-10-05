<script setup lang="ts">
import type { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { formRules } from "@/services/vuetify/formRules";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore<TodoListItem>()();
const { editedItem } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-container v-if="editedItem" fluid>
    <v-row>
      <v-col cols="12">
        <v-text-field v-model="editedItem.name" label="Name" :rules="[formRules.required]" />
      </v-col>
      <v-col cols="12">
        <v-textarea v-model="editedItem.notes" label="Notes" auto-grow />
      </v-col>
      <v-col cols="12">
        <!-- @vue-ignore @TODO: The type here should be fixed by vuetify team -->
        <v-date-picker
          v-model="editedItem.dueAt"
          title="Due Date"
          cancel-text="Clear"
          ok-text="Confirm"
          @click:cancel="editedItem.dueAt = null"
        />
      </v-col>
    </v-row>
  </v-container>
</template>
