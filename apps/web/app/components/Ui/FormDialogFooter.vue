<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";

interface Props {
  // Whether the form's fields pass their rules, which the Save answer waits on
  isValid: boolean;
}
// The footer of a dialog that wraps a form: Cancel closes it, and Save submits the form it sits in
const isOpen = defineModel<boolean>({ required: true });
defineProps<Props>();
</script>

<template>
  <footer flex gap-2 justify-end>
    <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
    <UiButton :disabled="!isValid" type="submit" :variant="UiButtonVariant.Accent">Save</UiButton>
  </footer>
</template>
