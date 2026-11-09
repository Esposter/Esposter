<script setup lang="ts">
import type { Promisable } from "type-fest";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiDialogSize } from "@/models/ui/UiDialogSize";

interface Props {
  // What answering does, awaited unless the write is optimistic (useDialogAnswer)
  confirm: () => Promisable<unknown>;
  // What confirming does, in the danger variant: "Delete"
  confirmLabel: string;
  // What the reader types before the answer enables, for an act worth the pause: the name of what it destroys
  confirmName?: string;
  // The write shows on screen before the server answers, so waiting for it would only hold a dialog over a change
  // Already made; a rejection is answered by its rollback and toast
  isOptimistic?: true;
  // How wide the dialog stands, Medium when none is named
  size?: UiDialogSize;
  title: string;
}
// A question before something that cannot be undone: what it acts on, Cancel, and the one destructive answer. An alert
// Dialog, as the pattern has it, that opens onto Cancel so a stray Enter never destroys anything, or onto the field a
// Guarded one asks the name in
defineSlots<{ default: () => VNode }>();
const isOpen = defineModel<boolean>({ default: false });
const {
  confirm,
  confirmLabel,
  confirmName = "",
  isOptimistic,
  size = UiDialogSize.Medium,
  title,
} = defineProps<Props>();
const { answer, isPending } = useDialogAnswer(isOpen);
const typedName = ref("");

watch(isOpen, (newIsOpen) => {
  if (!newIsOpen) typedName.value = "";
});
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" :size :title role="alertdialog">
    <slot />
    <template v-if="confirmName">
      <div px-2 py-1 flex gap-2 items-center ui-field>
        <code flex-1 truncate>{{ confirmName }}</code>
        <UiCopyButton :source="confirmName" />
      </div>
      <UiTextField v-model="typedName" is-autofocus :label="`Type '${confirmName}' to confirm`" />
    </template>
    <template #footer>
      <UiButton :variant="UiButtonVariant.Quiet" autofocus @click="isOpen = false">Cancel</UiButton>
      <UiButton
        :disabled="typedName !== confirmName"
        :is-pending
        :variant="UiButtonVariant.Danger"
        @click="answer(confirm, isOptimistic)"
      >
        {{ confirmLabel }}
      </UiButton>
    </template>
  </UiDialog>
</template>
