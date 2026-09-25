<script setup lang="ts">
import type { Promisable } from "type-fest";

interface Props {
  confirmLabel: string;
  isConfirmDisabled?: true;
  isOptimistic?: true;
  // What the valid form's submit does, awaited unless the write is optimistic (useDialogAnswer): a failed one keeps
  // The dialog open so the user can retry without losing their draft
  submit: () => Promisable<unknown>;
  title: string;
}
// What a call site passes goes to the dialog element, which it sizes
defineOptions({ inheritAttrs: false });
defineSlots<{
  default?: () => VNode;
  "prepend-actions"?: () => VNode;
  "prepend-confirm"?: () => VNode;
}>();
const isOpen = defineModel<boolean>({ default: false });
const { confirmLabel, isConfirmDisabled, isOptimistic, submit, title } = defineProps<Props>();
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
    :form-id
    :is-confirm-disabled="isConfirmDisabled || !isValid || undefined"
    :is-confirm-pending="isPending || undefined"
    :title
    :="$attrs"
  >
    <UiForm :id="formId" v-model:is-valid="isValid" flex flex-col gap-y-4 @submit="answer(submit, isOptimistic)">
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
