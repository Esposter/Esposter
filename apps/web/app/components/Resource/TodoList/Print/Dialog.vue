<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
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
  <UiDialog v-model="isDialogOpen" :placement="UiDialogPlacement.Middle" title="Print list" w="[min(24rem,90vw)]">
    <div p-3 flex flex-col gap-2>
      <UiSwitch v-model="isStepsPrinted" is-label-shown label="Print steps" />
      <UiSwitch v-model="isNotesPrinted" is-label-shown label="Print notes" />
    </div>
    <footer p-3 flex gap-2 justify-end>
      <UiButton :variant="UiButtonVariant.Quiet" @click="isDialogOpen = false">Cancel</UiButton>
      <UiButton :variant="UiButtonVariant.Accent" @click="print()">Print</UiButton>
    </footer>
  </UiDialog>
</template>
