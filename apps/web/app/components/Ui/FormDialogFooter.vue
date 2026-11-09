<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

interface Props {
  // The id of the form Save submits, for a footer drawn beside its form in the dialog's body rather than inside it
  formId?: string;
  // Whether the form's fields pass their rules, which the Save answer waits on
  isValid: boolean;
}
// The footer of a dialog that wraps a form: Cancel closes it, and Save submits the form it sits in, or the one named by
// The id it is given
const isOpen = defineModel<boolean>({ required: true });
const { formId, isValid } = defineProps<Props>();
</script>

<template>
  <footer flex gap-2 justify-end>
    <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
    <UiButton :disabled="!isValid" :form="formId" type="submit" :variant="UiButtonVariant.Accent">Save</UiButton>
  </footer>
</template>
