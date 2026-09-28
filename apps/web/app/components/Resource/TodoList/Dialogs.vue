<!-- Everything a TodoList opens from more than one blade or from its commands: the edit dialog, and Print list with the
     sheet it prints, which is mounted only while printing -->
<script setup lang="ts">
import { useTodoListPrintDialogStore } from "@/store/resource/todoList/printDialog";

const todoListPrintDialogStore = useTodoListPrintDialogStore();
const { isPrinting } = storeToRefs(todoListPrintDialogStore);
</script>

<template>
  <ResourceTodoListEditDialog />
  <ResourceTodoListPrintDialog />
  <ResourceTodoListPrintSheet v-if="isPrinting" />
</template>
