<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { checkIsBlankSource } from "@/services/emailEditor/checkIsBlankSource";
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
const isOpen = computed({
  get: () => isImportOpen.value,
  set: (newIsOpen) => {
    if (!newIsOpen) closeImport(resourceId);
  },
});
// A refused source keeps the dialog and its source for another try, and an accepted one closes it
const { answer, isPending } = useDialogAnswer(isOpen);
// The dialog is shut when its blade goes, so a reopened email does not reopen its import on mount
onUnmounted(() => {
  closeImport(resourceId);
});
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Import MJML" w="[min(48rem,90vw)]">
    <div p-3 flex flex-col gap-2>
      <UiTextField v-model="source" label="MJML source" :rows="20" />
      <p text-muted>The email is replaced by this source as one edit, so one undo restores it.</p>
    </div>
    <footer p-3 flex gap-2 justify-end>
      <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
      <UiButton
        :disabled="checkIsBlankSource(source)"
        :is-pending
        :variant="UiButtonVariant.Accent"
        @click="answer(() => importEmailSource(resourceId, source))"
      >
        Import
      </UiButton>
    </footer>
  </UiDialog>
</template>
