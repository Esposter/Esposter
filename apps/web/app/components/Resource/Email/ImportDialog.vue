<script setup lang="ts">
import { UiDialogSize } from "#src/models/ui/UiDialogSize";
import { useEmailImportDialogStore } from "#src/store/emailEditor/importDialog";
import { useResourceStore } from "#src/store/resource/index";
import { checkIsBlankText } from "@esposter/shared";

const emailImportDialogStore = useEmailImportDialogStore();
const { isImportOpen } = storeToRefs(emailImportDialogStore);
const { closeImport } = emailImportDialogStore;
const resourceStore = useResourceStore();
const { currentResourceId } = storeToRefs(resourceStore);
// The email this blade shows is the one the import answers for, read at setup so a close after the reader has left still names it
const resourceId = currentResourceId.value;
const { checkEmailSource, importEmailSource } = useImportEmailSource();
const source = ref("");
// The source is checked as it is typed, so a source the email's types refuse keeps the dialog open with its reason in the
// Field, and the import is sent only for one they take. A blank source is the empty field the confirm already holds
const sourceRules = [(value: string) => checkIsBlankText(value) || checkEmailSource(value)];
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
  <StyledFormDialog
    v-model="isOpen"
    confirm-label="Import"
    :is-confirm-disabled="checkIsBlankText(source) || undefined"
    :size="UiDialogSize.Large"
    :submit="() => importEmailSource(resourceId, source)"
    title="Import MJML"
  >
    <UiTextField v-model="source" label="MJML source" :rows="20" :rules="sourceRules" />
    <p text-muted>The email is replaced by this source as one edit, so one undo restores it.</p>
  </StyledFormDialog>
</template>
