<script setup lang="ts">
import type { TodoList } from "@/models/tableEditor/todoList/TodoList";
import { formRules } from "@/services/vuetify/formRules";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore<TodoList>()();
const { editedItem } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-container v-if="editedItem" fluid>
    <v-row>
      <v-col cols="12">
        <v-text-field v-model="editedItem.name" label="Name" :rules="[formRules.required]" />
      </v-col>
      <v-col cols="12">
        <v-textarea v-model="editedItem.notes" label="Notes" />
      </v-col>
    </v-row>
  </v-container>
</template>
