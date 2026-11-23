<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { checkIsBlankText } from "@esposter/shared";

interface Props {
  label: string;
  placeholder: string;
}

const addText = defineModel<string>({ required: true });
defineProps<Props>();
const emit = defineEmits<{ add: []; paste: [event: ClipboardEvent] }>();
</script>

<template>
  <UiForm flex gap-2 items-start @submit="emit('add')">
    <UiTextField
      v-model="addText"
      is-label-hidden
      :label
      :placeholder
      @paste="(event: ClipboardEvent) => emit('paste', event)"
    />
    <UiButton :disabled="checkIsBlankText(addText)" type="submit" :variant="UiButtonVariant.Quiet">Add</UiButton>
  </UiForm>
</template>
