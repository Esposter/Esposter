<script setup lang="ts">
import type { AwaitedReason } from "#src/models/shared/AwaitedReason";
import type { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import type { UiDialogSize } from "#src/models/ui/UiDialogSize";
import type { Promisable } from "type-fest";

interface Props {
  // Why the submit waits for the server, from the closed set; without one the dialog closes as its write is sent
  awaitedBecause?: AwaitedReason | undefined;
  confirmLabel: string;
  // The look of the confirm button, the accent when none is named, and danger for a submit that destroys something
  confirmVariant?: UiButtonVariant | undefined;
  isConfirmDisabled?: true | undefined;
  // How wide the dialog stands, Medium when none is named: the base shell holds that default
  size?: UiDialogSize | undefined;
  // What the valid form's submit does, closing the dialog as it is sent (useDialogAnswer). With `awaitedBecause`, a
  // Submit that resolves `false` keeps the dialog open so the user can retry without losing their draft
  submit: () => Promisable<unknown>;
  title: string;
}
// What a call site passes goes to the dialog element, which it sizes
defineOptions({ inheritAttrs: false });
defineSlots<{ default?: () => VNode; "prepend-actions"?: () => VNode; "prepend-confirm"?: () => VNode }>();
const isOpen = defineModel<boolean>({ default: false });
defineProps<Props>();
const { answer, isPending } = useDialogAnswer(isOpen);
const isValid = ref(true);
const formId = useId();
// The form mounts with each open, so the verdict on the one the dialog closed on does not carry over to the next
watch(isOpen, (newIsOpen) => {
  if (!newIsOpen) isValid.value = true;
});

defineExpose({ isValid });
</script>

<template>
  <StyledDialog
    v-model="isOpen"
    :confirm-label
    :confirm-variant
    :form-id
    :is-confirm-disabled="isConfirmDisabled || !isValid || undefined"
    :is-confirm-pending="isPending || undefined"
    :size
    :title
    :="$attrs"
  >
    <UiForm :id="formId" v-model:is-valid="isValid" flex flex-col gap-4 @submit="answer(submit, awaitedBecause)">
      <slot />
    </UiForm>
    <!-- Guarded, not forwarded outright: the shell reads the presence of these slots to decide whether there is an
      actions row at all, so an unconditional forward hands it a slot the consumer never passed. -->
    <template v-if="$slots['prepend-actions']" #prepend-actions>
      <slot name="prepend-actions" />
    </template>
    <template v-if="$slots['prepend-confirm']" #prepend-confirm>
      <slot name="prepend-confirm" />
    </template>
  </StyledDialog>
</template>
