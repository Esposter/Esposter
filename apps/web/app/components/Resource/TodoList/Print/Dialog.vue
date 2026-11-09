<script setup lang="ts">
import { UiDialogSize } from "@/models/ui/UiDialogSize";
import { useTodoListPrintDialogStore } from "@/store/resource/todoList/printDialog";

const todoListPrintDialogStore = useTodoListPrintDialogStore();
const { isDialogOpen, isNotesPrinted, isPrinting, isStepsPrinted } = storeToRefs(todoListPrintDialogStore);
// The sheet is drawn a tick before the browser's print dialog opens over it, and put away once that dialog closes. A
// Browser global the template cannot reach
const print = async () => {
  isDialogOpen.value = false;
  isPrinting.value = true;
  await nextTick();
  window.print();
};

useEventListener("afterprint", () => {
  isPrinting.value = false;
});
</script>

<!-- Microsoft To Do's Print list: what goes on the page besides each todo's title and due date, then the browser's own
     print dialog, which also saves a PDF -->
<template>
  <StyledDialog
    v-model="isDialogOpen"
    confirm-label="Print"
    :confirm="print"
    title="Print list"
    :size="UiDialogSize.Small"
  >
    <UiSwitch v-model="isStepsPrinted" is-label-shown label="Print steps" />
    <UiSwitch v-model="isNotesPrinted" is-label-shown label="Print notes" />
  </StyledDialog>
</template>
