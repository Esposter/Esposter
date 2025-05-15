<script setup lang="ts">
import { TableEditorType } from "#shared/models/tableEditor/data/TableEditorType";
import CalendarButton from "@/components/TableEditor/TodoList/CalendarButton.vue";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { tableEditorType } = storeToRefs(tableEditorStore);
</script>

<template>
  <TableEditorCrudViewHeader>
    <template v-if="tableEditorType === TableEditorType.TodoList" #append-header>
      <div pl-4>
        <CalendarButton />
      </div>
    </template>
  </TableEditorCrudViewHeader>
</template>
