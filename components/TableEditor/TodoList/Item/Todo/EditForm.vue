<script setup lang="ts">
import type { TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { formRules } from "@/services/vuetify/formRules";
import { useTableEditorStore } from "@/store/tableEditor";
import type { EventSourceInput } from "@fullcalendar/core";

const tableEditorStore = useTableEditorStore<TodoListItem>()();
const { tableEditor, editedItem } = storeToRefs(tableEditorStore);
const events = computed<EventSourceInput>(() => {
  const results: EventSourceInput = [];

  if (!editedItem.value) return results;

  for (const item of tableEditor.value.items) {
    if (!item.dueAt) continue;

    results.push({ id: item.id, title: item.name, description: item.notes, date: item.dueAt });
  }

  if (editedItem.value.dueAt)
    results.push({
      id: editedItem.value.id,
      title: editedItem.value.name,
      description: editedItem.value.notes,
      date: editedItem.value.dueAt,
    });
  return results.concat();
});
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
        <StyledDatePicker
          v-model="editedItem.dueAt"
          :date-picker-props="{ placeholder: 'Due Date', sixWeeks: 'append' }"
          @cleared="editedItem.dueAt = null"
        />
      </v-col>
      <v-col cols="12">
        <div text-3xl text-center font-bold>Timetable</div>
        <StyledCalendar pt-4 :calendar-options="{ events }" />
      </v-col>
    </v-row>
  </v-container>
</template>
