import { useResourceStore } from "@/store/resource";

// Print runs from the Export menu, which is outside any blade, so the dialog it opens is held here and mounted by the
// Blade shell. Whether it is open is keyed by the list it was opened for, and the two toggles are the viewer's, kept
// For the next print of any list. The sheet is mounted only between Print and the browser's afterprint
export const useTodoListPrintDialogStore = defineStore("resource/todoList/printDialog", () => {
  const resourceStore = useResourceStore();
  const { data: isDialogOpen, getDataRef: getIsDialogOpenRef } = useDataMap(
    () => resourceStore.currentResourceId,
    false,
  );
  const isNotesPrinted = ref(false);
  const isStepsPrinted = ref(true);
  const isPrinting = ref(false);
  const openDialog = (resourceId: string) => {
    const isDialogOpenRef = getIsDialogOpenRef(resourceId);
    isDialogOpenRef.value = true;
  };
  return { isDialogOpen, isNotesPrinted, isPrinting, isStepsPrinted, openDialog };
});
