<script setup lang="ts">
import { UiDialogSize } from "@/models/ui/UiDialogSize";
import { checkIsBlankSource } from "@/services/shared/checkIsBlankSource";
import { useEmailImportDialogStore } from "@/store/emailEditor/importDialog";
import { useResourceStore } from "@/store/resource";

const emailImportDialogStore = useEmailImportDialogStore();
const { isImportOpen } = storeToRefs(emailImportDialogStore);
const { closeImport } = emailImportDialogStore;
const resourceStore = useResourceStore();
const { currentResourceId } = storeToRefs(resourceStore);
// The email this blade shows is the one the import answers for, read at setup so a close after the reader has left still names it
const resourceId = currentResourceId.value;
const importEmailSource = useImportEmailSource();
const source = ref("");
// A refused source keeps the dialog and its source for another try, and an accepted one closes it
const isOpen = computed({
  get: () => isImportOpen.value,
  set: (newIsOpen) => {
    if (!newIsOpen) closeImport(resourceId);
  },
});
// The dialog is shut when its blade goes, so a reopened email does not reopen its import on mount
onUnmounted(() => {
  closeImport(resourceId);
});
</script>

<template>
  <StyledDialog
    v-model="isOpen"
    confirm-label="Import"
    :confirm="() => importEmailSource(resourceId, source)"
    :is-confirm-disabled="checkIsBlankSource(source) || undefined"
    title="Import MJML"
    :size="UiDialogSize.Large"
  >
    <UiTextField v-model="source" label="MJML source" :rows="20" />
    <p text-muted>The email is replaced by this source as one edit, so one undo restores it.</p>
  </StyledDialog>
</template>
